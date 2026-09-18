import type { Deadline, Urgency } from "@/lib/types";
import { calendarDaysUntil, formatTime, isSameLocalDay, isTomorrow } from "@/lib/dates";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export interface CountdownInfo {
  label: string;
  urgency: Urgency;
  msUntil: number;
}

export function getCountdownInfo(
  dateTime: string,
  now: Date = new Date(),
  completed = false,
): CountdownInfo {
  if (completed) {
    return { label: "Completed", urgency: "completed", msUntil: 0 };
  }

  const target = new Date(dateTime);
  if (Number.isNaN(target.getTime())) {
    return { label: "Unknown date", urgency: "normal", msUntil: Number.POSITIVE_INFINITY };
  }

  const msUntil = target.getTime() - now.getTime();

  if (msUntil < 0) {
    return { label: "Overdue", urgency: "overdue", msUntil };
  }

  const urgency = getUrgencyFromMs(msUntil);
  return { label: formatCountdownLabel(target, now, msUntil), urgency, msUntil };
}

export function getUrgencyFromMs(msUntil: number): Urgency {
  if (msUntil < 0) return "overdue";
  if (msUntil <= 3 * DAY) return "urgent";
  if (msUntil <= 7 * DAY) return "warning";
  return "normal";
}

export function formatCountdownLabel(target: Date, now: Date, msUntil: number): string {
  if (msUntil < HOUR) {
    const minutes = Math.max(1, Math.round(msUntil / MINUTE));
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} left`;
  }

  if (isSameLocalDay(target, now)) {
    if (msUntil < 6 * HOUR) {
      const hours = Math.max(1, Math.round(msUntil / HOUR));
      return `${hours} ${hours === 1 ? "hour" : "hours"} left`;
    }
    return `Today · ${formatTime(target.toISOString())}`;
  }

  if (isTomorrow(target, now)) {
    return "Tomorrow";
  }

  if (msUntil < DAY) {
    const hours = Math.max(1, Math.round(msUntil / HOUR));
    return `${hours} ${hours === 1 ? "hour" : "hours"} left`;
  }

  const days = Math.max(2, calendarDaysUntil(target, now));
  return `${days} ${days === 1 ? "day" : "days"} left`;
}

export function getNearestIncompleteDeadline(
  deadlines: Deadline[],
): Deadline | undefined {
  const incomplete = deadlines.filter((deadline) => !deadline.completed);
  if (incomplete.length === 0) return undefined;

  return [...incomplete].sort((a, b) => {
    const aTime = new Date(a.dateTime).getTime();
    const bTime = new Date(b.dateTime).getTime();
    const aValid = Number.isFinite(aTime);
    const bValid = Number.isFinite(bTime);
    if (!aValid && !bValid) return 0;
    if (!aValid) return 1;
    if (!bValid) return -1;
    return aTime - bTime;
  })[0];
}

export function getAttentionDeadlines<T extends { deadline: Deadline }>(
  items: T[],
  now: Date = new Date(),
): T[] {
  const threeDays = 3 * DAY;
  return items
    .filter(({ deadline }) => {
      if (deadline.completed) return false;
      const msUntil = new Date(deadline.dateTime).getTime() - now.getTime();
      return Number.isFinite(msUntil) && msUntil <= threeDays;
    })
    .sort((a, b) => {
      const aUntil = new Date(a.deadline.dateTime).getTime() - now.getTime();
      const bUntil = new Date(b.deadline.dateTime).getTime() - now.getTime();
      return aUntil - bUntil;
    });
}

export function getUpcomingDeadlines<T extends { deadline: Deadline }>(
  items: T[],
  now: Date = new Date(),
  limit = 5,
  excludeIds: Set<string> = new Set(),
): T[] {
  return items
    .filter(({ deadline }) => {
      if (deadline.completed || excludeIds.has(deadline.id)) return false;
      const msUntil = new Date(deadline.dateTime).getTime() - now.getTime();
      return Number.isFinite(msUntil) && msUntil >= 0;
    })
    .sort(
      (a, b) =>
        new Date(a.deadline.dateTime).getTime() -
        new Date(b.deadline.dateTime).getTime(),
    )
    .slice(0, limit);
}
