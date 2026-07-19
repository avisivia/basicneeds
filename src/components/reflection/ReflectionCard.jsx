import { ChevronDown } from "lucide-react";
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

function groupAnswersByNeed(session) {
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
  return [...groups.values()];
}

function AnswerGroups({ session }) {
  return (
    <div className="flex flex-col gap-5">
      {groupAnswersByNeed(session).map(({ need, answers }) => {
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
    </div>
  );
}

// collapsible: renders as a native <details> accordion — collapsed rows show
// just the date header with a chevron, no client-side JS needed. Used on
// history pages where many days stack up; the dashboard's Details tab keeps
// the always-open variant.
export function ReflectionCard({ session, collapsible = false, defaultOpen = false }) {
  const date = new Date(session.submitted_at);
  const dateLabel = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const timeLabel = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (!collapsible) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dateLabel}</CardTitle>
          <CardDescription>{timeLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          <AnswerGroups session={session} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-0 [--card-spacing:0]">
      <details className="group" open={defaultOpen || undefined}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
          <div>
            <p className="font-heading text-base leading-snug font-medium">
              {dateLabel}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{timeLabel}</p>
          </div>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-border p-4">
          <AnswerGroups session={session} />
        </div>
      </details>
    </Card>
  );
}
