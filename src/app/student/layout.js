import { requireRole } from "@/lib/dal";
import { AppShell } from "@/components/layout/AppShell";

const NAV_ITEMS = [
  { href: "/student/dashboard", label: "Today", icon: "dashboard" },
  { href: "/student/history", label: "History", icon: "history" },
];

export default async function StudentLayout({ children }) {
  const profile = await requireRole("student");

  return (
    <AppShell profile={profile} navItems={NAV_ITEMS}>
      {children}
    </AppShell>
  );
}
