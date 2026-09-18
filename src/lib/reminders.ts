import type { Deadline, DeadlineReminders, Hackathon, ReminderKey } from "@/lib/types";
import { REMINDER_KEYS } from "@/lib/types";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const DEFAULT_REMINDERS: DeadlineReminders = {
  sevenDaysBefore: true,
  threeDaysBefore: true,
  oneDayBefore: true,
  threeHoursBefore: true,
};

export const REMINDER_OPTIONS: {
  key: ReminderKey;
  label: string;
  offsetMs: number;
}[] = [
  { key: "sevenDaysBefore", label: "7 days before", offsetMs: 7 * DAY },
  { key: "threeDaysBefore", label: "3 days before", offsetMs: 3 * DAY },
  { key: "oneDayBefore", label: "1 day before", offsetMs: 1 * DAY },
  { key: "threeHoursBefore", label: "3 hours before", offsetMs: 3 * HOUR },
];

export function createDefaultReminders(): DeadlineReminders {
  return { ...DEFAULT_REMINDERS };
}

export function normalizeReminders(value: unknown): DeadlineReminders {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return createDefaultReminders();
  }

  const record = value as Record<string, unknown>;
  return {
    sevenDaysBefore: record.sevenDaysBefore !== false,
    threeDaysBefore: record.threeDaysBefore !== false,
    oneDayBefore: record.oneDayBefore !== false,
    threeHoursBefore: record.threeHoursBefore !== false,
  };
}

export function remindersWereMissing(value: unknown): boolean {
  return typeof value !== "object" || value === null || Array.isArray(value);
}

export interface ScheduledReminder {
  hackathonId: string;
  hackathonName: string;
  deadline: Deadline;
  reminderKey: ReminderKey;
  reminderLabel: string;
  triggerAt: string;
}

export function getScheduledReminders(
  hackathons: Hackathon[],
  now: Date = new Date(),
  limit = 5,
): ScheduledReminder[] {
  const nowMs = now.getTime();
  const upcoming: ScheduledReminder[] = [];

  for (const hackathon of hackathons) {
    for (const deadline of hackathon.deadlines) {
      if (deadline.completed) continue;
      const deadlineMs = new Date(deadline.dateTime).getTime();
      if (!Number.isFinite(deadlineMs) || deadlineMs < nowMs) continue;

      for (const option of REMINDER_OPTIONS) {
        if (!deadline.reminders[option.key]) continue;
        const triggerMs = deadlineMs - option.offsetMs;
        if (triggerMs < nowMs) continue;
        upcoming.push({
          hackathonId: hackathon.id,
          hackathonName: hackathon.name,
          deadline,
          reminderKey: option.key,
          reminderLabel: option.label,
          triggerAt: new Date(triggerMs).toISOString(),
        });
      }
    }
  }

  return upcoming
    .sort((a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime())
    .slice(0, limit);
}

export function enabledReminderLabels(reminders: DeadlineReminders): string[] {
  return REMINDER_OPTIONS.filter((option) => reminders[option.key]).map((option) => option.label);
}

export { REMINDER_KEYS };
