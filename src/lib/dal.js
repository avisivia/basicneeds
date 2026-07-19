import "server-only";

import { cache } from "react";
import { redirect, forbidden } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// Data Access Layer: every server-side read of "who is signed in" goes
// through here so the auth check can't be forgotten in some new page or
// service. cache() memoizes per-request so repeated calls (layout + page +
// a service function) only hit Supabase once.

export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async () => {
  const user = await getSession();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url, created_at")
    .eq("id", user.id)
    .single();

  return data;
});

// Redirects to /login if there's no session. proxy.js already does this
// optimistically for every request under /student and /teacher; this is
// the secure, close-to-the-data second check.
export async function requireProfile() {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }
  return profile;
}

// Renders app/forbidden.js (403) if the signed-in user's role isn't allowed.
export async function requireRole(...allowedRoles) {
  const profile = await requireProfile();
  if (!allowedRoles.includes(profile.role)) {
    forbidden();
  }
  return profile;
}
