import { redirect } from "next/navigation";
import { getProfile } from "@/lib/dal";
import { dashboardPathForRole } from "@/lib/constants";

export default async function Home() {
  const profile = await getProfile();
  redirect(profile ? dashboardPathForRole(profile.role) : "/login");
}
