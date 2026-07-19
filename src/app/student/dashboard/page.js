import { Sparkles } from "lucide-react";
import { getProfile } from "@/lib/dal";
import {
  getActiveQuestions,
  getTodaysSession,
  getStudentNeedPerformance,
} from "@/services/reflections";
import { getNeeds } from "@/services/needs";
import { ReflectionForm } from "@/components/reflection/ReflectionForm";
import { ReflectionCard } from "@/components/reflection/ReflectionCard";
import { ReReflectButton } from "@/components/forms/ReReflectButton";
import { NeedIcon } from "@/components/shared/NeedIcon";
import { NeedRadarChart } from "@/components/charts/NeedRadarChart";
import { NeedBarChart } from "@/components/charts/NeedBarChart";
import { LIKERT_OPTIONS } from "@/lib/constants";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export const metadata = { title: "Today — Basic Needs Tracker" };

const LABEL_BY_SCORE = Object.fromEntries(
  LIKERT_OPTIONS.map((o) => [o.value, o.label])
);

export default async function StudentDashboardPage() {
  const profile = await getProfile();
  const [questions, todaysSession] = await Promise.all([
    getActiveQuestions(),
    getTodaysSession(profile.id),
  ]);

  if (!todaysSession) {
    return <ReflectionForm questions={questions} />;
  }

  const [monthlyPerformance, needs] = await Promise.all([
    getStudentNeedPerformance(profile.id, { days: 30 }),
    getNeeds(),
  ]);

  const todayByNeed = new Map();
  for (const answer of todaysSession.reflection_answers ?? []) {
    if (!answer.needs) continue;
    const bucket = todayByNeed.get(answer.needs.key) ?? {
      need: answer.needs,
      total: 0,
      count: 0,
    };
    bucket.total += answer.score;
    bucket.count += 1;
    todayByNeed.set(answer.needs.key, bucket);
  }

  const monthlyByKey = new Map(monthlyPerformance.map((m) => [m.key, m]));
  const radarData = needs.map((need) => ({
    label: need.label,
    avg: monthlyByKey.get(need.key)?.avg ?? 0,
  }));
  const barData = needs.map((need) => ({
    key: need.key,
    label: need.label,
    color: need.color,
    avg: monthlyByKey.get(need.key)?.avg ?? 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">You&apos;ve already reflected today!</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Nice work — here&apos;s how today went.
            </p>
          </div>
        </div>
        <ReReflectButton />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-4 pt-3">
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
            {[...todayByNeed.values()].map(({ need, total, count }) => {
              const avg = total / count;
              const percent = Math.round((avg / 5) * 100);
              return (
                <div key={need.key} className="flex items-center gap-3 p-3">
                  <NeedIcon need={need} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{need.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {LABEL_BY_SCORE[Math.round(avg)]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted sm:w-24">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: need.color }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm font-semibold">
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* <Card>
            <CardHeader>
              <CardTitle>This month&apos;s performance</CardTitle>
              <CardDescription>
                Average across all your reflections in the last 30 days —
                shows where you&apos;re doing well and where things have been
                lower.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NeedRadarChart data={radarData} />
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader>
              <CardTitle>Average score by need</CardTitle>
              <CardDescription>Same 30-day data, as a bar chart.</CardDescription>
            </CardHeader>
            <CardContent>
              <NeedBarChart data={barData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="pt-3">
          <ReflectionCard session={todaysSession} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
