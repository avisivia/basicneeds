import { GraduationCap } from "lucide-react";
import { getAllTeachers } from "@/services/admin";
import { getProfile } from "@/lib/dal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { RoleToggleButton } from "@/components/forms/RoleToggleButton";

export const metadata = { title: "Teachers — Basic Needs Tracker" };

export default async function AdminTeachersPage() {
  const [teachers, me] = await Promise.all([getAllTeachers(), getProfile()]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Teachers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {teachers.length} teacher{teachers.length === 1 ? "" : "s"}
        </p>
      </div>

      {teachers.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No teachers yet"
          description="Teachers appear here once they sign up."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Classes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{t.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={t.role === "admin" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {t.role}
                  </Badge>
                </TableCell>
                <TableCell>{t.classCount}</TableCell>
                <TableCell className="text-right">
                  {t.id === me.id ? (
                    <span className="text-xs text-muted-foreground">You</span>
                  ) : (
                    <RoleToggleButton userId={t.id} currentRole={t.role} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
