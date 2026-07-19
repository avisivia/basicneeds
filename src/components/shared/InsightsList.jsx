import { TrendingDown, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICONS = {
  decline: TrendingDown,
  low: AlertCircle,
  improvement: TrendingUp,
  high: Sparkles,
};

const STYLES = {
  decline: "text-destructive",
  low: "text-destructive",
  improvement: "text-emerald-600 dark:text-emerald-400",
  high: "text-emerald-600 dark:text-emerald-400",
};

export function InsightsList({ insights }) {
  if (insights.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {insights.map((insight, i) => {
            const Icon = ICONS[insight.type];
            return (
              <li
                key={`${insight.needKey}-${insight.type}-${i}`}
                className="flex items-start gap-2 text-sm"
              >
                <Icon className={cn("mt-0.5 size-4 shrink-0", STYLES[insight.type])} />
                <span>{insight.message}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
