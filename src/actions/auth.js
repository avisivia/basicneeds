"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { dashboardPathForRole } from "@/lib/constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(prevState, formData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "student");
  const teacherCode = String(formData.get("teacherCode") ?? "");

  if (fullName.length < 2) {
    return { error: "Please enter your full name." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!["student", "teacher"].includes(role)) {
    return { error: "Please select a role." };
  }
  if (role === "teacher" && teacherCode !== process.env.TEACHER_SIGNUP_CODE) {
    return { error: "That teacher access code isn't valid." };
  }

  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("app_settings")
    .select("require_email_verification")
    .single();
  const requireVerification = settings?.require_email_verification ?? true;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });

  if (error) {
    return { error: error.message };
  }

  // Skip email confirmation: auto-confirm via the service role (the only
  // client that can), then sign in normally to get a real session/cookie.
  if (!data.session && !requireVerification) {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(data.user.id, { email_confirm: true });

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      return {
        error: "Account created, but automatic sign-in failed. Please log in.",
      };
    }

    redirect(dashboardPathForRole(role));
  }

  if (!data.session) {
    return {
      success: true,
      message: "Check your email to confirm your account before logging in.",
    };
  }

  redirect(dashboardPathForRole(role));
}

export async function login(prevState, formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!EMAIL_RE.test(email) || !password) {
    return { error: "Please enter a valid email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const home = dashboardPathForRole(profile?.role ?? "student");
  const destination =
    next && next.startsWith(home.split("/").slice(0, 2).join("/"))
      ? next
      : home;

  redirect(destination);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
