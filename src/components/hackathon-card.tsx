import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { ProgressIndicator } from "@/components/progress-indicator";
import { StatusBadge } from "@/components/status-badge";
import { getNearestIncompleteDeadline, getCountdownInfo } from "@/lib/countdown";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Hackathon } from "@/lib/types";

export function HackathonCard({ hackathon, now }: { hackathon: Hackathon; now: Date }) {
  const nearest = getNearestIncompleteDeadline(hackathon.deadlines);
  const urgency = nearest
    ? getCountdownInfo(nearest.dateTime, now, nearest.completed).urgency
    : "normal";
  const completedRequirements = hackathon.requirements.filter((item) => item.completed).length;

  return (
    <Link
      href={`/hackathons/${hackathon.id}`}
      className={cn(
        "block rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40",
        urgency === "overdue" && "border-overdue/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium">{hackathon.name}</h3>
          {hackathon.organizer ? (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{hackathon.organizer}</p>
          ) : (
            <p className="mt-0.5 text-sm text-muted-foreground">No organizer listed</p>
          )}
        </div>
        <StatusBadge status={hackathon.status} />
      </div>

      <div className="mt-4 space-y-1">
        {nearest ? (
          <>
            <p className="text-sm font-medium">{nearest.title}</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-muted-foreground">{formatDateTime(nearest.dateTime)}</p>
              <Countdown dateTime={nearest.dateTime} completed={nearest.completed} />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
        )}
      </div>

      <div className="mt-4">
        <ProgressIndicator
          label="Requirements"
          completed={completedRequirements}
          total={hackathon.requirements.length}
        />
      </div>
    </Link>
  );
}
