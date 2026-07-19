import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function RecentSubmissions({ items }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent submissions</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No submissions in this range yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/teacher/students/${item.studentId}`}
                  className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-muted/50"
                >
                  <span className="text-sm font-medium">{item.studentName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.submittedAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
