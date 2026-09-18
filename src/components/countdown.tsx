"use client";

import { getCountdownInfo } from "@/lib/countdown";
import { cn } from "@/lib/utils";
import { useNow } from "@/hooks/use-now";
import type { Urgency } from "@/lib/types";

const URGENCY_STYLES: Record<Urgency, string> = {
  overdue: "text-overdue bg-overdue/10 border-overdue/20",
  urgent: "text-urgent bg-urgent/10 border-urgent/20",
  warning: "text-warning bg-warning/12 border-warning/25",
  normal: "text-muted-foreground bg-muted border-border",
  completed: "text-ok bg-ok/10 border-ok/20",
};

export function Countdown({
  dateTime,
  completed = false,
  className,
}: {
  dateTime: string;
  completed?: boolean;
  className?: string;
}) {
  const now = useNow();
  const info = getCountdownInfo(dateTime, now, completed);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tabular-nums",
        URGENCY_STYLES[info.urgency],
        className,
      )}
    >
      {info.label}
    </span>
  );
}

export function countdownUrgencyClass(urgency: Urgency): string {
  return URGENCY_STYLES[urgency];
}
