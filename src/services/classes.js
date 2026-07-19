import "server-only";
import { createClient } from "@/utils/supabase/server";

export async function getTeacherClasses(teacherId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teacher_assignments")
    .select("class_id, classes(id, name, grade_level, created_at)")
    .eq("teacher_id", teacherId)
    .order("assigned_at");

  if (error) throw error;
  return data.map((row) => row.classes).filter(Boolean);
}

export async function getClassRoster(classId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("class_students")
    .select("student_id, joined_at, profiles(id, full_name)")
    .eq("class_id", classId)
    .order("joined_at");

  if (error) throw error;
  return data.map((row) => row.profiles).filter(Boolean);
}

// RLS (profiles_select_by_teacher) naturally returns null if the caller
// doesn't teach this student — callers should treat that as a 404.
export async function getStudentProfile(studentId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("id", studentId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Backed by the find_student_by_email() Postgres function (security definer,
// restricted to teachers/admins) since profiles has no email column and a
// teacher can't otherwise see a student's row before they share a class.
export async function findStudentByEmail(email) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("find_student_by_email", {
    lookup_email: email,
  });

  if (error) throw error;
  return data?.[0] ?? null;
}
