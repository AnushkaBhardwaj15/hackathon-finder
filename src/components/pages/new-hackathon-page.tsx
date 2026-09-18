"use client";

import { HackathonForm } from "@/components/hackathon-form";
import { useHackathons } from "@/hooks/use-hackathons";

export function NewHackathonPage() {
  const { create } = useHackathons();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Add hackathon</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Capture the dates, links, and checklist before anything slips.
        </p>
      </div>
      <HackathonForm onSave={create} />
    </div>
  );
}
