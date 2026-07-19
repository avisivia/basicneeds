import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({ label, value, icon: Icon, className }) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        {Icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
