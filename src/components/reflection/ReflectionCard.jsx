import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { NeedIcon } from "@/components/shared/NeedIcon";
import { LIKERT_OPTIONS } from "@/lib/constants";

const LABEL_BY_SCORE = Object.fromEntries(
  LIKERT_OPTIONS.map((o) => [o.value, o.label])
);

export function ReflectionCard({ session }) {
  const date = new Date(session.submitted_at);

  const groups = new Map();
  for (const answer of session.reflection_answers ?? []) {
    if (!answer.needs) continue;
    const bucket = groups.get(answer.needs.key) ?? {
      need: answer.needs,
      answers: [],
    };
    bucket.answers.push(answer);
    groups.set(answer.needs.key, bucket);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {date.toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </CardTitle>
        <CardDescription>
          {date.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {[...groups.values()].map(({ need, answers }) => {
          const avg =
            Math.round(
              (answers.reduce((sum, a) => sum + a.score, 0) / answers.length) * 10
            ) / 10;

          return (
            <div key={need.key} className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <NeedIcon need={need} size="sm" />
                <span className="font-medium" style={{ color: need.color }}>
                  {need.label}
                </span>
                <span className="ml-auto text-sm font-semibold text-muted-foreground">
                  {avg}/5 avg
                </span>
              </div>
              <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-3">
                {answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="text-foreground/90">{answer.questions?.prompt}</p>
                      {answer.comment && (
                        <p className="mt-0.5 text-xs text-muted-foreground italic">
                          &ldquo;{answer.comment}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      {LABEL_BY_SCORE[answer.score]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
