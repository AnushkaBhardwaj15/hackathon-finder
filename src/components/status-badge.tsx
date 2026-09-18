import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { HackathonStatus } from "@/lib/types";

const STATUS_STYLES: Record<HackathonStatus, string> = {
  interested: "bg-muted text-muted-foreground border-transparent",
  registered: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-transparent",
  building: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-transparent",
  submitted: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-transparent",
  completed: "bg-ok/10 text-ok border-transparent",
};

export function StatusBadge({
  status,
  className,
}: {
  status: HackathonStatus;
  className?: string;
}) {
  return (
    <Badge className={cn(STATUS_STYLES[status], className)} variant="secondary">
      {STATUS_LABELS[status]}
    </Badge>
  );
}
