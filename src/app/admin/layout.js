import { requireRole } from "@/lib/dal";
import { AppShell } from "@/components/layout/AppShell";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/teachers", label: "Teachers", icon: "teachers" },
  { href: "/admin/classes", label: "Classes", icon: "classes" },
  { href: "/admin/students", label: "Students", icon: "students" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export default async function AdminLayout({ children }) {
  const profile = await requireRole("admin");

  return (
    <AppShell profile={profile} navItems={NAV_ITEMS}>
      {children}
    </AppShell>
  );
}
