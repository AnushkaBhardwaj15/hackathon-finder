"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { hackathonService } from "@/lib/hackathons";
import {
  getHackathonsSnapshot,
  getServerHackathonsSnapshot,
  subscribeHackathons,
} from "@/lib/storage";
import type { Deadline, HackathonDraft, Requirement } from "@/lib/types";

export function useHackathons() {
  const hackathons = useSyncExternalStore(
    subscribeHackathons,
    getHackathonsSnapshot,
    getServerHackathonsSnapshot,
  );

  const hydrated = useSyncExternalStore(
    subscribeHackathons,
    () => true,
    () => false,
  );

  const byId = useCallback(
    (id: string) => hackathons.find((hackathon) => hackathon.id === id),
    [hackathons],
  );

  const api = useMemo(
    () => ({
      create: (draft: HackathonDraft) => hackathonService.create(draft),
      update: (id: string, draft: HackathonDraft) => hackathonService.update(id, draft),
      remove: (id: string) => hackathonService.remove(id),
      setDeadlineCompleted: (hackathonId: string, deadlineId: string, completed: boolean) =>
        hackathonService.setDeadlineCompleted(hackathonId, deadlineId, completed),
      addDeadline: (hackathonId: string, deadline: Omit<Deadline, "id">) =>
        hackathonService.addDeadline(hackathonId, deadline),
      removeDeadline: (hackathonId: string, deadlineId: string) =>
        hackathonService.removeDeadline(hackathonId, deadlineId),
      setRequirementCompleted: (
        hackathonId: string,
        requirementId: string,
        completed: boolean,
      ) => hackathonService.setRequirementCompleted(hackathonId, requirementId, completed),
      addRequirement: (hackathonId: string, requirement: Omit<Requirement, "id">) =>
        hackathonService.addRequirement(hackathonId, requirement),
      removeRequirement: (hackathonId: string, requirementId: string) =>
        hackathonService.removeRequirement(hackathonId, requirementId),
      updateNotes: (hackathonId: string, notes: string) =>
        hackathonService.updateNotes(hackathonId, notes),
    }),
    [],
  );

  return { hackathons, hydrated, byId, ...api };
}

export function useHackathon(id: string) {
  const store = useHackathons();
  return {
    ...store,
    hackathon: store.byId(id),
  };
}
