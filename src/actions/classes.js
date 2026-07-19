"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/dal";
import { createClient } from "@/utils/supabase/server";
import { findStudentByEmail } from "@/services/classes";

export async function createClass(prevState, formData) {
  const profile = await requireRole("teacher", "admin");

  const name = String(formData.get("name") ?? "").trim();
  const gradeLevel = String(formData.get("gradeLevel") ?? "").trim();

  if (name.length < 2) {
    return { error: "Please enter a class name." };
  }

  const supabase = await createClient();

  const { data: klass, error: classError } = await supabase
    .from("classes")
    .insert({
      name,
      grade_level: gradeLevel || null,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (classError) {
    return { error: "Something went wrong creating the class. Please try again." };
  }

  const { error: assignError } = await supabase
    .from("teacher_assignments")
    .insert({ teacher_id: profile.id, class_id: klass.id });

  if (assignError) {
    return { error: "Class was created, but we couldn't assign you to it. Please contact support." };
  }

  revalidatePath("/teacher/students");
  revalidatePath("/teacher/dashboard");

  return { success: true };
}

export async function addStudentToClass(prevState, formData) {
  await requireRole("teacher", "admin");

  const classId = String(formData.get("classId") ?? "");
  const email = String(formData.get("email") ?? "").trim();

  if (!classId) {
    return { error: "Select a class first." };
  }
  if (!email) {
    return { error: "Enter a student's email." };
  }

  const student = await findStudentByEmail(email);
  if (!student) {
    return {
      error: "No student found with that email. Ask them to sign up first.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("class_students")
    .insert({ class_id: classId, student_id: student.id });

  if (error) {
    if (error.code === "23505") {
      return { error: `${student.full_name} is already in this class.` };
    }
    return { error: "You don't have access to that class." };
  }

  revalidatePath("/teacher/students");
  revalidatePath("/teacher/dashboard");

  return { success: true, studentName: student.full_name };
}
