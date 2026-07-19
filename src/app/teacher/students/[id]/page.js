import { notFound } from "next/navigation";
import { getStudentProfile } from "@/services/classes";
import { getStudentHistory } from "@/services/reflections";
import { getNeeds } from "@/services/needs";
import { generateInsights } from "@/lib/insights";
import { buildNeedTrendData } from "@/lib/charts";
import { ReflectionCard } from "@/components/reflection/ReflectionCard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { InsightsList } from "@/components/shared/InsightsList";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const student = await getStudentProfile(id);
  return {
    title: student
      ? `${student.full_name} — Basic Needs Tracker`
      : "Student — Basic Needs Tracker",
  };
}

export default async function TeacherStudentDetailPage({ params }) {
  const { id } = await params;
  const student = await getStudentProfile(id);

  if (!student || student.role !== "student") {
    notFound();
  }

  const [sessions, needs] = await Promise.all([
    getStudentHistory(id),
    getNeeds(),
  ]);

  const { chartData, series } = buildNeedTrendData(sessions, needs);
  const insights = generateInsights(sessions);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">{student.full_name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reflection history and trends.
        </p>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          title="No reflections yet"
          description="This student hasn't submitted a reflection yet."
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
