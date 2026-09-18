"use client";

import Link from "next/link";
import { HackathonForm } from "@/components/hackathon-form";
import { Button } from "@/components/ui/button";
import { useHackathon } from "@/hooks/use-hackathons";

export function EditHackathonPage({ id }: { id: string }) {
  const { hackathon, hydrated, update } = useHackathon(id);

  if (!hydrated) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
  }

  if (!hackathon) {
    return <MissingHackathon />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Edit hackathon</h1>
        <p className="mt-1 text-sm text-muted-foreground">{hackathon.name}</p>
      </div>
      <HackathonForm
        initial={hackathon}
        onSave={(draft) => {
          const saved = update(id, draft);
          if (!saved) throw new Error("Hackathon could not be updated.");
          return saved;
        }}
      />
    </div>
  );
}

function MissingHackathon() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-semibold">Hackathon not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">It may have been deleted from this browser.</p>
      <Button className="mt-5" nativeButton={false} render={<Link href="/hackathons" />}>
        Back to hackathons
      </Button>
    </div>
  );
}
