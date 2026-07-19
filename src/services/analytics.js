import "server-only";
import { createClient } from "@/utils/supabase/server";
import { ATTENTION_THRESHOLD } from "@/lib/constants";

const EMPTY_METRICS = {
  totalStudents: 0,
  completedToday: 0,
  completionPct: 0,
  avgByNeed: [],
  concernBreakdown: [],
  trendData: [],
  recentSubmissions: [],
  needingAttention: [],
};

// Every query below runs on the teacher's own RLS-scoped client. RLS
// (is_teacher_of / teaches_class) already restricts every result to this
// teacher's own students, so class_id/date filters here are just narrowing
// an already-safe result set, not the security boundary itself.
export async function getDashboardMetrics(_teacherId, { classId, days = 14 } = {}) {
  const supabase = await createClient();

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  let rosterQuery = supabase
    .from("class_students")
    .select("student_id, profiles(id, full_name)");
  if (classId) rosterQuery = rosterQuery.eq("class_id", classId);
  const { data: rosterRows, error: rosterError } = await rosterQuery;
  if (rosterError) throw rosterError;

  const rosterNameById = new Map();
  for (const row of rosterRows) {
    if (row.profiles) rosterNameById.set(row.student_id, row.profiles.full_name);
  }
  const studentIds = [...rosterNameById.keys()];
  const totalStudents = studentIds.length;

  if (totalStudents === 0) {
    return EMPTY_METRICS;
  }

  let sessionsQuery = supabase
    .from("reflection_sessions")
    .select("id, student_id, submitted_at")
    .in("student_id", studentIds)
    .gte("submitted_at", sinceDate.toISOString())
    .order("submitted_at", { ascending: false });
  if (classId) sessionsQuery = sessionsQuery.eq("class_id", classId);
  const { data: sessions, error: sessionsError } = await sessionsQuery;
  if (sessionsError) throw sessionsError;

  const completedToday = sessions.filter(
    (s) => new Date(s.submitted_at) >= todayStart
  ).length;
  const completionPct = Math.round((completedToday / totalStudents) * 100);

  const sessionIds = sessions.map((s) => s.id);
  let answers = [];
  if (sessionIds.length > 0) {
    const { data: answerRows, error: answersError } = await supabase
      .from("reflection_answers")
      .select("session_id, score, needs(key, label, color)")
      .in("session_id", sessionIds);
    if (answersError) throw answersError;
    answers = answerRows;
  }

  const needBuckets = new Map();
  for (const a of answers) {
    if (!a.needs) continue;
    const bucket = needBuckets.get(a.needs.key) ?? {
      key: a.needs.key,
      label: a.needs.label,
      color: a.needs.color,
      total: 0,
      count: 0,
    };
    bucket.total += a.score;
    bucket.count += 1;
    needBuckets.set(a.needs.key, bucket);
  }
  const avgByNeed = [...needBuckets.values()].map((b) => ({
    key: b.key,
    label: b.label,
    color: b.color,
    avg: Math.round((b.total / b.count) * 100) / 100,
  }));

  // "Most common concern": distribution of low scores (<= threshold) by need.
  const concernBuckets = new Map();
  for (const a of answers) {
    if (!a.needs || a.score > ATTENTION_THRESHOLD) continue;
    const bucket = concernBuckets.get(a.needs.key) ?? {
      key: a.needs.key,
      label: a.needs.label,
      color: a.needs.color,
      count: 0,
    };
    bucket.count += 1;
    concernBuckets.set(a.needs.key, bucket);
  }
  const concernBreakdown = [...concernBuckets.values()];

  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const dayBuckets = new Map();
  for (const a of answers) {
    const session = sessionById.get(a.session_id);
    if (!session || !a.needs) continue;
    const d = new Date(session.submitted_at);
    const isoDate = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const row = dayBuckets.get(isoDate) ?? { label, sums: {}, counts: {} };
    row.sums[a.needs.key] = (row.sums[a.needs.key] ?? 0) + a.score;
    row.counts[a.needs.key] = (row.counts[a.needs.key] ?? 0) + 1;
    dayBuckets.set(isoDate, row);
  }
  const trendData = [...dayBuckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([, row]) => {
      const out = { date: row.label };
      for (const key of Object.keys(row.sums)) {
        out[key] = Math.round((row.sums[key] / row.counts[key]) * 100) / 100;
      }
      return out;
    });

  const recentSubmissions = sessions.slice(0, 8).map((s) => ({
    id: s.id,
    studentId: s.student_id,
    studentName: rosterNameById.get(s.student_id) ?? "Student",
    submittedAt: s.submitted_at,
  }));

  let attentionQuery = supabase
    .from("v_student_latest_scores")
    .select("student_id, class_id, need_label, recent_avg_score")
    .in("student_id", studentIds)
    .lte("recent_avg_score", ATTENTION_THRESHOLD);
  if (classId) attentionQuery = attentionQuery.eq("class_id", classId);
  const { data: attentionRows, error: attentionError } = await attentionQuery;
  if (attentionError) throw attentionError;

  const needingAttention = attentionRows.map((row) => ({
    studentId: row.student_id,
    studentName: rosterNameById.get(row.student_id) ?? "Student",
    needLabel: row.need_label,
    avgScore: row.recent_avg_score,
  }));

  return {
    totalStudents,
    completedToday,
    completionPct,
    avgByNeed,
    concernBreakdown,
    trendData,
    recentSubmissions,
    needingAttention,
  };
}
