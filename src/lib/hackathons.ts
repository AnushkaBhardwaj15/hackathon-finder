import { createId } from "@/lib/ids";
import { hackathonStorage } from "@/lib/storage";
import type { Deadline, Hackathon, HackathonDraft, Requirement } from "@/lib/types";

function touch(hackathon: Hackathon): Hackathon {
  return { ...hackathon, updatedAt: new Date().toISOString() };
}

export const hackathonService = {
  list(): Hackathon[] {
    return hackathonStorage.getAll();
  },

  get(id: string): Hackathon | undefined {
    return hackathonStorage.getById(id);
  },

  create(draft: HackathonDraft): Hackathon {
    const now = new Date().toISOString();
    const hackathon: Hackathon = {
      ...draft,
      id: createId(),
      createdAt: now,
      updatedAt: now,
    };
    return hackathonStorage.save(hackathon);
  },

  update(id: string, draft: HackathonDraft): Hackathon | undefined {
    const existing = hackathonStorage.getById(id);
    if (!existing) return undefined;
    return hackathonStorage.save(
      touch({
        ...existing,
        ...draft,
        id: existing.id,
        createdAt: existing.createdAt,
      }),
    );
  },

  remove(id: string): boolean {
    return hackathonStorage.remove(id);
  },

  setDeadlineCompleted(hackathonId: string, deadlineId: string, completed: boolean): Hackathon | undefined {
    const existing = hackathonStorage.getById(hackathonId);
    if (!existing) return undefined;
    return hackathonStorage.save(
      touch({
        ...existing,
        deadlines: existing.deadlines.map((deadline) =>
          deadline.id === deadlineId ? { ...deadline, completed } : deadline,
        ),
      }),
    );
  },

  addDeadline(hackathonId: string, deadline: Omit<Deadline, "id">): Hackathon | undefined {
    const existing = hackathonStorage.getById(hackathonId);
    if (!existing) return undefined;
    return hackathonStorage.save(
      touch({
        ...existing,
        deadlines: [...existing.deadlines, { ...deadline, id: createId() }],
      }),
    );
  },

  removeDeadline(hackathonId: string, deadlineId: string): Hackathon | undefined {
    const existing = hackathonStorage.getById(hackathonId);
    if (!existing) return undefined;
    return hackathonStorage.save(
      touch({
        ...existing,
        deadlines: existing.deadlines.filter((deadline) => deadline.id !== deadlineId),
      }),
    );
  },

  setRequirementCompleted(
    hackathonId: string,
    requirementId: string,
    completed: boolean,
  ): Hackathon | undefined {
    const existing = hackathonStorage.getById(hackathonId);
    if (!existing) return undefined;
    return hackathonStorage.save(
      touch({
        ...existing,
        requirements: existing.requirements.map((requirement) =>
          requirement.id === requirementId ? { ...requirement, completed } : requirement,
        ),
      }),
    );
  },

  addRequirement(hackathonId: string, requirement: Omit<Requirement, "id">): Hackathon | undefined {
    const existing = hackathonStorage.getById(hackathonId);
    if (!existing) return undefined;
    return hackathonStorage.save(
      touch({
        ...existing,
        requirements: [...existing.requirements, { ...requirement, id: createId() }],
      }),
    );
  },

  removeRequirement(hackathonId: string, requirementId: string): Hackathon | undefined {
    const existing = hackathonStorage.getById(hackathonId);
    if (!existing) return undefined;
    return hackathonStorage.save(
      touch({
        ...existing,
        requirements: existing.requirements.filter((requirement) => requirement.id !== requirementId),
      }),
    );
  },

  updateNotes(hackathonId: string, notes: string): Hackathon | undefined {
    const existing = hackathonStorage.getById(hackathonId);
    if (!existing) return undefined;
    return hackathonStorage.save(touch({ ...existing, notes }));
  },
};
