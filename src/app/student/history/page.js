import { getProfile } from "@/lib/dal";
import { getStudentHistory } from "@/services/reflections";
import { getNeeds } from "@/services/needs";
import { generateInsights } from "@/lib/insights";
import { buildNeedTrendData } from "@/lib/charts";
import { ReflectionCard } from "@/components/reflection/ReflectionCard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { InsightsList } from "@/components/shared/InsightsList";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata = { title: "History — Basic Needs Tracker" };

export default async function StudentHistoryPage() {
  const profile = await getProfile();
  const [sessions, needs] = await Promise.all([
    getStudentHistory(profile.id),
    getNeeds(),
  ]);

  const { chartData, series } = buildNeedTrendData(sessions, needs);
  const insights = generateInsights(sessions);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Your reflection history</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Past reflections and score trends.
        </p>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          title="No reflections yet"
          description="Submit your first reflection to start seeing your history here."
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Score trends</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendLineChart data={chartData} series={series} />
            </CardContent>
          </Card>

          <InsightsList insights={insights} />

          <div className="flex flex-col gap-3">
            {sessions.map((session, index) => (
              <ReflectionCard
                key={session.id}
                session={session}
                collapsible
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
