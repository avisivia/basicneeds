import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { MobileTabBar } from "./MobileTabBar";

export function AppShell({ profile, navItems, children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar profile={profile} />
      <div className="flex flex-1">
        <Sidebar items={navItems} />
        <main className="flex-1 px-4 pt-4 pb-20 md:px-6 md:pt-6 md:pb-6">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
      <MobileTabBar items={navItems} />
    </div>
  );
}
