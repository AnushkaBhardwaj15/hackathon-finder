"use client";

import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Countdown } from "@/components/countdown";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/dates";
import { DEADLINE_TYPE_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { getCountdownInfo } from "@/lib/countdown";
import { useNow } from "@/hooks/use-now";
import { Trash2 } from "lucide-react";
import type { Deadline } from "@/lib/types";

export function DeadlineItem({
  deadline,
  onToggle,
  onDelete,
}: {
  deadline: Deadline;
  onToggle?: (completed: boolean) => void;
  onDelete?: () => void;
}) {
  const now = useNow();
  const urgency = getCountdownInfo(deadline.dateTime, now, deadline.completed).urgency;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-3 py-3",
        urgency === "overdue" && !deadline.completed && "border-overdue/30 bg-overdue/5",
        urgency === "urgent" && !deadline.completed && "border-urgent/25 bg-urgent/5",
      )}
    >
      {onToggle ? (
        <Checkbox
          checked={deadline.completed}
          onCheckedChange={(checked) => onToggle(checked === true)}
          className="mt-0.5"
          aria-label={`Mark ${deadline.title} complete`}
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className={cn("font-medium", deadline.completed && "text-muted-foreground line-through")}>
            {deadline.title}
          </p>
          <span className="text-xs text-muted-foreground">{DEADLINE_TYPE_LABELS[deadline.type]}</span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{formatDateTime(deadline.dateTime)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Countdown dateTime={deadline.dateTime} completed={deadline.completed} />
        {onDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            aria-label={`Delete ${deadline.title}`}
          >
            <Trash2 />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function DeadlineRowLink({
  hackathonId,
  hackathonName,
  deadline,
}: {
  hackathonId: string;
  hackathonName: string;
  deadline: Deadline;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{hackathonName}</p>
        <p className="font-medium">{deadline.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{formatDateTime(deadline.dateTime)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Countdown dateTime={deadline.dateTime} completed={deadline.completed} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/hackathons/${hackathonId}`} />}>
          Open
        </Button>
      </div>
    </div>
  );
}
