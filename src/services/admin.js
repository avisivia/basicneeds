import "server-only";
import { createClient } from "@/utils/supabase/server";

export async function getAppSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("require_email_verification, updated_at")
    .single();

  if (error) throw error;
  return data;
}

export async function getAdminStats() {
  const supabase = await createClient();

  const [teachers, students, classes, sessions] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "teacher"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student"),
    supabase.from("classes").select("id", { count: "exact", head: true }),
    supabase
      .from("reflection_sessions")
      .select("id", { count: "exact", head: true }),
  ]);

  return {
    totalTeachers: teachers.count ?? 0,
    totalStudents: students.count ?? 0,
    totalClasses: classes.count ?? 0,
    totalReflections: sessions.count ?? 0,
  };
}

// Backed by the admin_list_users() Postgres function (security definer,
// admin-only) since profiles has no email column.
async function getAllUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_users");

  if (error) throw error;
  return data;
}

export async function getAllTeachers() {
  const [users, supabase] = await Promise.all([getAllUsers(), createClient()]);
  const teachers = users.filter((u) => u.role === "teacher" || u.role === "admin");

  const { data: assignments } = await supabase
    .from("teacher_assignments")
    .select("teacher_id");

  const classCountByTeacher = new Map();
  for (const row of assignments ?? []) {
    classCountByTeacher.set(
      row.teacher_id,
      (classCountByTeacher.get(row.teacher_id) ?? 0) + 1
    );
  }

  return teachers.map((t) => ({
    ...t,
    classCount: classCountByTeacher.get(t.id) ?? 0,
  }));
}

export async function getAllStudents() {
  const [users, supabase] = await Promise.all([getAllUsers(), createClient()]);
  const students = users.filter((u) => u.role === "student");

  const { data: memberships } = await supabase
    .from("class_students")
    .select("student_id");

  const classCountByStudent = new Map();
  for (const row of memberships ?? []) {
    classCountByStudent.set(
      row.student_id,
      (classCountByStudent.get(row.student_id) ?? 0) + 1
    );
  }

  return students.map((s) => ({
    ...s,
    classCount: classCountByStudent.get(s.id) ?? 0,
  }));
}

export async function getAllClasses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select(
      "id, name, grade_level, created_at, class_students(student_id), teacher_assignments(teacher_id, profiles(full_name))"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((c) => ({
    id: c.id,
    name: c.name,
    gradeLevel: c.grade_level,
    createdAt: c.created_at,
    studentCount: c.class_students?.length ?? 0,
    teacherNames: (c.teacher_assignments ?? [])
      .map((ta) => ta.profiles?.full_name)
      .filter(Boolean),
  }));
}
