import Link from "next/link";

import { UserMenu } from "./UserMenu";
import { dashboardPathForRole } from "@/lib/constants";

export function Navbar({ profile }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
      <Link
        href={dashboardPathForRole(profile.role)}
        className="text-sm font-semibold"
      >
        Basic Needs Tracker
      </Link>
      <UserMenu profile={profile} />
    </header>
  );
}
