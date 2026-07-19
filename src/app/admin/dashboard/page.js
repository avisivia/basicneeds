import { GraduationCap, Users, BookOpen, CalendarCheck } from "lucide-react";
import { getAdminStats } from "@/services/admin";
import { MetricCard } from "@/components/dashboard/MetricCard";

export const metadata = { title: "Admin Dashboard — Basic Needs Tracker" };

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A birds-eye view of the whole app.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Teachers" value={stats.totalTeachers} icon={GraduationCap} />
        <MetricCard label="Students" value={stats.totalStudents} icon={Users} />
        <MetricCard label="Classes" value={stats.totalClasses} icon={BookOpen} />
        <MetricCard
          label="Reflections submitted"
          value={stats.totalReflections}
          icon={CalendarCheck}
        />
      </div>
    </div>
  );
}
