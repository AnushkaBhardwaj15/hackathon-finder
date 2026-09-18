"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { HackathonCard } from "@/components/hackathon-card";
import { useHackathons } from "@/hooks/use-hackathons";
import { useNow } from "@/hooks/use-now";
import { getNearestIncompleteDeadline } from "@/lib/countdown";
import { STATUS_LABELS } from "@/lib/labels";
import { HACKATHON_STATUSES, type Hackathon, type HackathonStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | HackathonStatus;
type SortKey = "nearest" | "recent" | "name";

export function HackathonsPage() {
  const { hackathons, hydrated } = useHackathons();
  const now = useNow();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("nearest");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = hackathons.filter((hackathon) => {
      const matchesQuery = !normalized || hackathon.name.toLowerCase().includes(normalized);
      const matchesStatus = status === "all" || hackathon.status === status;
      return matchesQuery && matchesStatus;
    });

    return result.sort((a, b) => compareHackathons(a, b, sort));
  }, [hackathons, query, status, sort]);

  if (!hydrated) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">All hackathons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, filter, and jump straight into the next deadline.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/hackathons/new" />}>
          <Plus />
          Add Hackathon
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name"
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", ...HACKATHON_STATUSES] as StatusFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium",
                status === item
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {item === "all" ? "All" : STATUS_LABELS[item]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["nearest", "Nearest deadline"],
              ["recent", "Recently added"],
              ["name", "Name"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSort(value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium",
                sort === value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {hackathons.length === 0 ? (
        <EmptyState
          title="Nothing here yet."
          description="Add your first hackathon and keep every deadline in one place."
          actionHref="/hackathons/new"
          actionLabel="Add Hackathon"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching hackathons."
          description="Try a different search or filter."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((hackathon) => (
            <HackathonCard key={hackathon.id} hackathon={hackathon} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

function compareHackathons(a: Hackathon, b: Hackathon, sort: SortKey): number {
  if (sort === "name") return a.name.localeCompare(b.name);
  if (sort === "recent") {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }

  const aNearest = getNearestIncompleteDeadline(a.deadlines);
  const bNearest = getNearestIncompleteDeadline(b.deadlines);
  if (!aNearest && !bNearest) return a.name.localeCompare(b.name);
  if (!aNearest) return 1;
  if (!bNearest) return -1;
  return new Date(aNearest.dateTime).getTime() - new Date(bNearest.dateTime).getTime();
}
