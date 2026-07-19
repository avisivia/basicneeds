import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function NeedingAttentionList({ items }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Students needing attention</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nobody is flagged right now — nice.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item, i) => (
              <li key={`${item.studentId}-${item.needLabel}-${i}`}>
                <Link
                  href={`/teacher/students/${item.studentId}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-destructive" />
                    <div>
                      <p className="text-sm font-medium">{item.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        Low {item.needLabel} score
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{item.avgScore}/5</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
