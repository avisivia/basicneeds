import { Suspense } from "react";
import { Users, CalendarCheck, Percent } from "lucide-react";

import { getProfile } from "@/lib/dal";
import { getTeacherClasses } from "@/services/classes";
import { getDashboardMetrics } from "@/services/analytics";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { NeedingAttentionList } from "@/components/dashboard/NeedingAttentionList";
import { RecentSubmissions } from "@/components/dashboard/RecentSubmissions";
import { NeedBarChart } from "@/components/charts/NeedBarChart";
import { ConcernPieChart } from "@/components/charts/ConcernPieChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { ClassFilterSelect } from "@/components/shared/ClassFilterSelect";
import { DateRangeSelect } from "@/components/shared/DateRangeSelect";
import { EmptyState } from "@/components/shared/EmptyState";
import { CreateClassDialog } from "@/components/forms/CreateClassDialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata = { title: "Dashboard — Basic Needs Tracker" };

export default async function TeacherDashboardPage({ searchParams }) {
  const profile = await getProfile();
  const classes = await getTeacherClasses(profile.id);

  if (classes.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a class to start seeing analytics.
            </p>
          </div>
          <CreateClassDialog />
        </div>
        <EmptyState
          icon={Users}
          title="No classes yet"
          description="Once you create a class and add students, their reflections will show up here."
        />
      </div>
    );
  }

  const { classId, days: rawDays } = await searchParams;
  const activeClassId = classes.some((c) => c.id === classId) ? classId : undefined;
  const days = ["7", "14", "30", "90"].includes(rawDays) ? rawDays : "14";

  const metrics = await getDashboardMetrics(profile.id, {
    classId: activeClassId,
    days: Number(days),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview across {activeClassId ? "this class" : "all your classes"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Suspense fallback={null}>
            <ClassFilterSelect
              classes={classes}
              value={activeClassId ?? "all"}
              allowAll
            />
            <DateRangeSelect value={days} />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard label="Total students" value={metrics.totalStudents} icon={Users} />
        <MetricCard
          label="Reflections completed today"
          value={metrics.completedToday}
          icon={CalendarCheck}
        />
        <MetricCard
          label="Completion rate today"
          value={`${metrics.completionPct}%`}
          icon={Percent}
        />
      </div>

      {metrics.totalStudents === 0 ? (
        <EmptyState
          icon={Users}
          title="No students in this view"
          description="Add students to this class, or switch to a different one."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Average score by need</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.avgByNeed.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No reflections in this range yet.
                  </p>
                ) : (
                  <NeedBarChart
                    data={metrics.avgByNeed.map((n) => ({ ...n, label: n.label }))}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most common concern</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.concernBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No low scores in this range — nice.
                  </p>
                ) : (
                  <ConcernPieChart data={metrics.concernBreakdown} />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Trend over time</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.trendData.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Not enough data yet to chart a trend.
                </p>
              ) : (
                <TrendLineChart
                  data={metrics.trendData}
                  series={metrics.avgByNeed.map((n) => ({
                    key: n.key,
                    label: n.label,
                    color: n.color,
                  }))}
                />
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <NeedingAttentionList items={metrics.needingAttention} />
            <RecentSubmissions items={metrics.recentSubmissions} />
          </div>
        </>
      )}
    </div>
  );
}
