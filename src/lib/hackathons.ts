import { createId } from "@/lib/ids";
import { hackathonStorage } from "@/lib/storage";
import type { Deadline, DeadlineReminders, Hackathon, HackathonDraft, Requirement } from "@/lib/types";
import { createDefaultReminders } from "@/lib/reminders";

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
      deadlines: draft.deadlines.map((deadline) => ({
        ...deadline,
        reminders: deadline.reminders ?? createDefaultReminders(),
      })),
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
        deadlines: [
          ...existing.deadlines,
          {
            ...deadline,
            id: createId(),
            reminders: deadline.reminders ?? createDefaultReminders(),
          },
        ],
      }),
    );
  }

  updateDeadlineReminders(
    hackathonId: string,
    deadlineId: string,
    reminders: DeadlineReminders,
  ): Hackathon | undefined {
    const existing = hackathonStorage.getById(hackathonId);
    if (!existing) return undefined;
    return hackathonStorage.save(
      touch({
        ...existing,
        deadlines: existing.deadlines.map((deadline) =>
          deadline.id === deadlineId ? { ...deadline, reminders } : deadline,
        ),
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
