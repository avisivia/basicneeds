import "server-only";
import { createClient } from "@/utils/supabase/server";

export function utcStartOfToday() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString();
}

export async function getActiveQuestions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select("id, prompt, sort_order, need_id, needs(key, label, color, sort_order)")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;

  return [...data].sort(
    (a, b) => (a.needs?.sort_order ?? 0) - (b.needs?.sort_order ?? 0)
  );
}

export async function getStudentClassId(studentId) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_students")
    .select("class_id")
    .eq("student_id", studentId)
    .limit(1)
    .maybeSingle();

  return data?.class_id ?? null;
}

const SESSION_WITH_ANSWERS_SELECT =
  "id, submitted_at, reflection_answers(id, score, comment, need_id, question_id, needs(key, label, color), questions(prompt))";

export async function getTodaysSession(studentId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reflection_sessions")
    .select(SESSION_WITH_ANSWERS_SELECT)
    .eq("student_id", studentId)
    .gte("submitted_at", utcStartOfToday())
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getStudentHistory(studentId, { limit = 30 } = {}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reflection_sessions")
    .select(SESSION_WITH_ANSWERS_SELECT)
    .eq("student_id", studentId)
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Average score per need across the last `days` calendar days — powers the
// dashboard's monthly performance graph, independent of today's session.
export async function getStudentNeedPerformance(studentId, { days = 30 } = {}) {
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: sessions, error: sessionsError } = await supabase
    .from("reflection_sessions")
    .select("id")
    .eq("student_id", studentId)
    .gte("submitted_at", since.toISOString());
  if (sessionsError) throw sessionsError;

  const sessionIds = sessions.map((s) => s.id);
  if (sessionIds.length === 0) return [];

  const { data: answers, error: answersError } = await supabase
    .from("reflection_answers")
    .select("score, needs(key, label, color)")
    .in("session_id", sessionIds);
  if (answersError) throw answersError;

  const byNeed = new Map();
  for (const a of answers) {
    if (!a.needs) continue;
    const bucket = byNeed.get(a.needs.key) ?? {
      key: a.needs.key,
      label: a.needs.label,
      color: a.needs.color,
      total: 0,
      count: 0,
    };
    bucket.total += a.score;
    bucket.count += 1;
    byNeed.set(a.needs.key, bucket);
  }

  return [...byNeed.values()].map((b) => ({
    key: b.key,
    label: b.label,
    color: b.color,
    avg: Math.round((b.total / b.count) * 100) / 100,
  }));
}
