import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS entirely. Only for the narrow cases
// RLS can't handle — right now, auto-confirming a new signup's email when
// the admin panel's "require email verification" setting is off. Never
// import this outside src/actions or src/services, and never expose it or
// its results wholesale to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
