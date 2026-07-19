import { BookOpen } from "lucide-react";
import { getAllClasses } from "@/services/admin";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata = { title: "Classes — Basic Needs Tracker" };

export default async function AdminClassesPage() {
  const classes = await getAllClasses();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Classes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {classes.length} class{classes.length === 1 ? "" : "es"}
        </p>
      </div>

      {classes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No classes yet"
          description="Classes appear here once a teacher creates one."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Grade level</TableHead>
              <TableHead>Teacher(s)</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {c.gradeLevel || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.teacherNames.length > 0 ? c.teacherNames.join(", ") : "—"}
                </TableCell>
                <TableCell>{c.studentCount}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
