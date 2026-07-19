// Shared by the student history page and the teacher's individual student
// page — both need the same session-list -> per-day/per-need chart shape.
export function buildNeedTrendData(sessions, needs) {
  const chartData = [...sessions].reverse().map((session) => {
    const row = {
      date: new Date(session.submitted_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    };
    for (const answer of session.reflection_answers) {
      row[answer.needs.key] = answer.score;
    }
    return row;
  });

  const series = needs.map((need) => ({
    key: need.key,
    label: need.label,
    color: need.color,
  }));

  return { chartData, series };
}
