import { ATTENTION_THRESHOLD } from "@/lib/constants";

const HIGH_THRESHOLD = 4.5;
const TREND_DELTA = 0.75;
const PRIORITY = { decline: 0, low: 1, improvement: 2, high: 3 };

function average(points) {
  return points.reduce((sum, p) => sum + p.score, 0) / points.length;
}

// Pure function: given a student's reflection sessions (any order, each with
// { submitted_at, reflection_answers: [{ score, needs: { key, label } }] }),
// returns insight objects sorted with the most actionable ones first
// (declining/low scores before improving/high ones).
export function generateInsights(sessions) {
  if (!sessions || sessions.length < 2) return [];

  const chronological = [...sessions].sort(
    (a, b) => new Date(a.submitted_at) - new Date(b.submitted_at)
  );

  const byNeed = new Map();
  for (const session of chronological) {
    for (const answer of session.reflection_answers ?? []) {
      const need = answer.needs;
      if (!need) continue;
      const bucket = byNeed.get(need.key) ?? { label: need.label, points: [] };
      bucket.points.push({ date: session.submitted_at, score: answer.score });
      byNeed.set(need.key, bucket);
    }
  }

  const insights = [];

  for (const [key, { label, points }] of byNeed) {
    if (points.length < 2) continue;

    const recentWindow = points.slice(-3);
    const recentAvg = average(recentWindow);

    const mid = Math.floor(points.length / 2);
    const firstHalf = points.slice(0, Math.max(mid, 1));
    const secondHalf = points.slice(-Math.max(points.length - mid, 1));
    const delta = average(secondHalf) - average(firstHalf);

    if (delta <= -TREND_DELTA) {
      insights.push({
        type: "decline",
        needKey: key,
        message: `${label} has decreased over your last ${points.length} reflections.`,
      });
    } else if (delta >= TREND_DELTA) {
      insights.push({
        type: "improvement",
        needKey: key,
        message: `${label} scores have improved recently.`,
      });
    }

    if (recentAvg <= ATTENTION_THRESHOLD) {
      insights.push({
        type: "low",
        needKey: key,
        message: `${label} scores remain consistently low.`,
      });
    } else if (recentAvg >= HIGH_THRESHOLD) {
      insights.push({
        type: "high",
        needKey: key,
        message: `${label} has been consistently strong.`,
      });
    }
  }

  return insights
    .sort((a, b) => PRIORITY[a.type] - PRIORITY[b.type])
    .slice(0, 4);
}
