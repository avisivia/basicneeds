import {
  LayoutDashboard,
  History,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
} from "lucide-react";

// Nav items are built in Server Component layouts and passed as props into
// client-side Sidebar/MobileTabBar. Component references can't cross that
// boundary (RSC props must be serializable), so layouts pass a string key
// and the client components resolve it to an icon locally via this map.
export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  history: History,
  students: Users,
  teachers: GraduationCap,
  classes: BookOpen,
  settings: Settings,
};
