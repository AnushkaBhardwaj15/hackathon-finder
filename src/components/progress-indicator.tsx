import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ProgressIndicator({
  label,
  completed,
  total,
  className,
}: {
  label: string;
  completed: number;
  total: number;
  className?: string;
}) {
  const value = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums text-foreground">
          {completed} / {total}
        </span>
      </div>
      <Progress value={value} className="w-full" />
    </div>
  );
}
