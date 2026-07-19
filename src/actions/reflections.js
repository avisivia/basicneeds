"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/dal";
import { createClient } from "@/utils/supabase/server";
import { getStudentClassId, utcStartOfToday } from "@/services/reflections";

export async function submitReflection(answers) {
  const profile = await requireRole("student");

  if (!Array.isArray(answers) || answers.length === 0) {
    return { error: "No answers provided." };
  }
  for (const a of answers) {
    if (
      !a.questionId ||
      !a.needId ||
      !Number.isInteger(a.score) ||
      a.score < 1 ||
      a.score > 5
    ) {
      return { error: "Each question needs a rating from 1 to 5." };
    }
  }

  const supabase = await createClient();
  const classId = await getStudentClassId(profile.id);

  const { data: session, error: sessionError } = await supabase
    .from("reflection_sessions")
    .insert({ student_id: profile.id, class_id: classId })
    .select("id")
    .single();

  if (sessionError) {
    if (sessionError.code === "23505") {
      return { error: "You've already submitted a reflection today." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  const { error: answersError } = await supabase.from("reflection_answers").insert(
    answers.map((a) => ({
      session_id: session.id,
      question_id: a.questionId,
      need_id: a.needId,
      score: a.score,
      comment: a.comment || null,
    }))
  );

  if (answersError) {
    // Best-effort cleanup so a failed answers insert doesn't leave an
    // empty session behind and block tomorrow's unique-per-day check.
    await supabase.from("reflection_sessions").delete().eq("id", session.id);
    return { error: "Something went wrong saving your answers. Please try again." };
  }

  revalidatePath("/student/dashboard");
  revalidatePath("/student/history");

  return { success: true };
}

// Deletes today's reflection so the student can submit a fresh one. RLS
// (reflection_sessions_delete_own_today) enforces the "today only" rule at
// the database level too, so this can't be used to touch older history
// even if called directly.
export async function reReflectToday() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { error } = await supabase
    .from("reflection_sessions")
    .delete()
    .eq("student_id", profile.id)
    .gte("submitted_at", utcStartOfToday());

  if (error) {
    return { error: "Couldn't start over. Please try again." };
  }

  revalidatePath("/student/dashboard");
  revalidatePath("/student/history");

  return { success: true };
}
