import { Suspense } from "react";
import { Users } from "lucide-react";

import { getProfile } from "@/lib/dal";
import { getTeacherClasses, getClassRoster } from "@/services/classes";
import { CreateClassDialog } from "@/components/forms/CreateClassDialog";
import { AddStudentDialog } from "@/components/forms/AddStudentDialog";
import { ClassFilterSelect } from "@/components/shared/ClassFilterSelect";
import { StudentsTable } from "@/components/dashboard/StudentsTable";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata = { title: "Students — Basic Needs Tracker" };

export default async function TeacherStudentsPage({ searchParams }) {
  const profile = await getProfile();
  const classes = await getTeacherClasses(profile.id);

  if (classes.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Students</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a class to start building your roster.
            </p>
          </div>
          <CreateClassDialog />
        </div>
        <EmptyState
          icon={Users}
          title="No classes yet"
          description="Create your first class, then add students by the email they signed up with."
        />
      </div>
    );
  }

  const { classId: rawClassId } = await searchParams;
  const activeClassId = classes.some((c) => c.id === rawClassId)
    ? rawClassId
    : classes[0].id;
  const roster = await getClassRoster(activeClassId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Students</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {roster.length} student{roster.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Suspense fallback={null}>
            <ClassFilterSelect
              classes={classes}
              value={activeClassId}
              allowAll={false}
            />
          </Suspense>
          <AddStudentDialog classId={activeClassId} />
          <CreateClassDialog />
        </div>
      </div>

      {roster.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students yet"
          description="Add a student by the email they signed up with."
        />
      ) : (
        <StudentsTable students={roster} />
      )}
    </div>
  );
}
