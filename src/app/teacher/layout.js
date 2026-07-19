import { requireRole } from "@/lib/dal";
import { AppShell } from "@/components/layout/AppShell";

const NAV_ITEMS = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/teacher/students", label: "Students", icon: "students" },
];

export default async function TeacherLayout({ children }) {
  const profile = await requireRole("teacher", "admin");

  return (
    <AppShell profile={profile} navItems={NAV_ITEMS}>
      {children}
    </AppShell>
  );
}
