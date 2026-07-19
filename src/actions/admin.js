"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/dal";
import { createClient } from "@/utils/supabase/server";

export async function updateAppSettings(prevState, formData) {
  await requireRole("admin");

  const requireEmailVerification = formData.get("requireEmailVerification") === "true";

  const supabase = await createClient();
  const { error } = await supabase
    .from("app_settings")
    .update({
      require_email_verification: requireEmailVerification,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) {
    return { error: "Couldn't save settings. Please try again." };
  }

  revalidatePath("/admin/settings");
  return { success: true, requireEmailVerification };
}

export async function setUserRole(prevState, formData) {
  const admin = await requireRole("admin");

  const userId = String(formData.get("userId") ?? "");
  const newRole = String(formData.get("newRole") ?? "");

  if (!["teacher", "admin"].includes(newRole)) {
    return { error: "Invalid role." };
  }
  if (userId === admin.id) {
    return { error: "You can't change your own role." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    return { error: "Couldn't update role. Please try again." };
  }

  revalidatePath("/admin/teachers");
  return { success: true };
}
