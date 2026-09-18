"use client";

import Link from "next/link";
import { Bell, Flame, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/countdown";
import { EmptyState } from "@/components/empty-state";
import { HackathonCard } from "@/components/hackathon-card";
import { DeadlineRowLink } from "@/components/deadline-item";
import { useHackathons } from "@/hooks/use-hackathons";
import { useNow } from "@/hooks/use-now";
import {
  getAttentionDeadlines,
  getUpcomingDeadlines,
} from "@/lib/countdown";
import { formatDateTime, formatReminderWhen } from "@/lib/dates";
import { greetingForHour } from "@/lib/dates";
import { USER_NAME } from "@/lib/labels";
import { getScheduledReminders } from "@/lib/reminders";
import type { Deadline, Hackathon } from "@/lib/types";

type DeadlineRef = {
  hackathon: Hackathon;
  deadline: Deadline;
};

export function DashboardPage() {
  const { hackathons, hydrated } = useHackathons();
  const now = useNow();

  if (!hydrated) {
    return <PageSkeleton />;
  }

  const greeting = greetingForHour(now.getHours());
  const allDeadlineRefs: DeadlineRef[] = hackathons.flatMap((hackathon) =>
    hackathon.deadlines.map((deadline) => ({ hackathon, deadline })),
  );
  const attention = getAttentionDeadlines(allDeadlineRefs, now);
  const attentionIds = new Set(attention.map(({ deadline }) => deadline.id));
  const upcomingReminders = getScheduledReminders(hackathons, now, 5);
  const upcoming = getUpcomingDeadlines(allDeadlineRefs, now, 5, attentionIds);
  const active = hackathons.filter((hackathon) =>
    ["registered", "building", "submitted"].includes(hackathon.status),
  );
  const counts = {
    active: hackathons.filter((hackathon) =>
      ["registered", "building"].includes(hackathon.status),
    ).length,
    upcoming: hackathons.filter((hackathon) => hackathon.status === "interested").length,
    submitted: hackathons.filter((hackathon) => hackathon.status === "submitted").length,
    completed: hackathons.filter((hackathon) => hackathon.status === "completed").length,
  };

  if (hackathons.length === 0) {
    return (
      <div className="space-y-8">
        <Header greeting={greeting} />
        <EmptyState
          title="Nothing here yet."
          description="Add your first hackathon and keep every deadline in one place."
          actionHref="/hackathons/new"
          actionLabel="Add Hackathon"
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Header greeting={greeting} />

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
          <Flame className="size-4 text-urgent" />
          Needs attention
        </h2>
        {attention.length === 0 ? (
          <div className="rounded-xl border bg-card px-4 py-6 text-sm text-muted-foreground">
            You&apos;re all clear 🎉 Nothing overdue or due in the next 3 days.
          </div>
        ) : (
          <div className="space-y-2">
            {attention.map(({ hackathon, deadline }) => (
              <div
                key={`${hackathon.id}-${deadline.id}`}
                className="flex flex-col gap-3 rounded-xl border border-urgent/25 bg-urgent/5 p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">{hackathon.name}</p>
                  <p className="font-medium">{deadline.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatDateTime(deadline.dateTime)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Countdown dateTime={deadline.dateTime} completed={deadline.completed} />
                  <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/hackathons/${hackathon.id}`} />}>
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Next deadlines</h2>
        {upcoming.length === 0 ? (
          <div className="rounded-xl border bg-card px-4 py-6 text-sm text-muted-foreground">
            You&apos;re all clear 🎉
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map(({ hackathon, deadline }) => (
              <DeadlineRowLink
                key={`${hackathon.id}-${deadline.id}`}
                hackathonId={hackathon.id}
                hackathonName={hackathon.name}
                deadline={deadline}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Active hackathons</h2>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active hackathons right now.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {active.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} now={now} />
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CountCard label="Active" value={counts.active} />
        <CountCard label="Upcoming" value={counts.upcoming} />
        <CountCard label="Submitted" value={counts.submitted} />
        <CountCard label="Completed" value={counts.completed} />
      </section>
    </div>
  );
}

function Header({ greeting }: { greeting: string }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">HackTracker</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {greeting}, {USER_NAME} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">What do you need to do next?</p>
      </div>
      <Button nativeButton={false} render={<Link href="/hackathons/new" />}>
        <Plus />
        Add Hackathon
      </Button>
    </div>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function PageSkeleton() {
  return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
}
