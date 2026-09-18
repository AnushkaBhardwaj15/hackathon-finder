import type { Deadline, DeadlineType, Hackathon, HackathonStatus, Requirement } from "@/lib/types";
import { DEADLINE_TYPES, HACKATHON_STATUSES } from "@/lib/types";

export const HACKATHONS_STORAGE_KEY = "hacktracker:hackathons";
const CHANGE_EVENT = "hacktracker:change";

const EMPTY: Hackathon[] = [];

let snapshotCache: Hackathon[] = EMPTY;
let snapshotRaw = "__uninitialized__";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asStatus(value: unknown): HackathonStatus {
  return HACKATHON_STATUSES.includes(value as HackathonStatus)
    ? (value as HackathonStatus)
    : "interested";
}

function asDeadlineType(value: unknown): DeadlineType {
  return DEADLINE_TYPES.includes(value as DeadlineType)
    ? (value as DeadlineType)
    : "other";
}

function parseDeadline(value: unknown): Deadline | null {
  if (!isRecord(value) || typeof value.id !== "string" || !value.id) return null;
  const dateTime = asString(value.dateTime);
  if (!dateTime) return null;
  return {
    id: value.id,
    title: asString(value.title) || "Untitled deadline",
    type: asDeadlineType(value.type),
    dateTime,
    completed: asBoolean(value.completed),
  };
}

function parseRequirement(value: unknown): Requirement | null {
  if (!isRecord(value) || typeof value.id !== "string" || !value.id) return null;
  const title = asString(value.title);
  if (!title) return null;
  return {
    id: value.id,
    title,
    description: asString(value.description),
    required: asBoolean(value.required),
    completed: asBoolean(value.completed),
  };
}

function parseHackathon(value: unknown): Hackathon | null {
  if (!isRecord(value) || typeof value.id !== "string" || !value.id) return null;
  const name = asString(value.name);
  if (!name) return null;

  const createdAt = asString(value.createdAt) || new Date().toISOString();
  const updatedAt = asString(value.updatedAt) || createdAt;

  return {
    id: value.id,
    name,
    organizer: asString(value.organizer),
    platform: asString(value.platform),
    description: asString(value.description),
    status: asStatus(value.status),
    registrationUrl: asString(value.registrationUrl),
    rulesUrl: asString(value.rulesUrl),
    submissionUrl: asString(value.submissionUrl),
    resultsUrl: asString(value.resultsUrl),
    discordUrl: asString(value.discordUrl),
    githubUrl: asString(value.githubUrl),
    projectUrl: asString(value.projectUrl),
    demoUrl: asString(value.demoUrl),
    notes: asString(value.notes),
    deadlines: Array.isArray(value.deadlines)
      ? value.deadlines.map(parseDeadline).filter((item): item is Deadline => item !== null)
      : [],
    requirements: Array.isArray(value.requirements)
      ? value.requirements
          .map(parseRequirement)
          .filter((item): item is Requirement => item !== null)
      : [],
    createdAt,
    updatedAt,
  };
}

export function parseHackathons(raw: string): Hackathon[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseHackathon).filter((item): item is Hackathon => item !== null);
  } catch {
    return [];
  }
}

function readRaw(): string {
  if (!canUseStorage()) return "[]";
  try {
    return window.localStorage.getItem(HACKATHONS_STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function writeAll(hackathons: Hackathon[]): void {
  if (!canUseStorage()) return;
  const raw = JSON.stringify(hackathons);
  window.localStorage.setItem(HACKATHONS_STORAGE_KEY, raw);
  snapshotRaw = raw;
  snapshotCache = hackathons;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getHackathonsSnapshot(): Hackathon[] {
  const raw = readRaw();
  if (raw === snapshotRaw) return snapshotCache;
  snapshotRaw = raw;
  snapshotCache = parseHackathons(raw);
  return snapshotCache;
}

export function getServerHackathonsSnapshot(): Hackathon[] {
  return EMPTY;
}

export function subscribeHackathons(onStoreChange: () => void): () => void {
  if (!canUseStorage()) return () => {};

  const onChange = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export const hackathonStorage = {
  getAll(): Hackathon[] {
    return getHackathonsSnapshot();
  },

  getById(id: string): Hackathon | undefined {
    return getHackathonsSnapshot().find((hackathon) => hackathon.id === id);
  },

  save(hackathon: Hackathon): Hackathon {
    const current = getHackathonsSnapshot();
    const index = current.findIndex((item) => item.id === hackathon.id);
    const next =
      index === -1
        ? [...current, hackathon]
        : current.map((item, itemIndex) => (itemIndex === index ? hackathon : item));
    writeAll(next);
    return hackathon;
  },

  remove(id: string): boolean {
    const current = getHackathonsSnapshot();
    const next = current.filter((item) => item.id !== id);
    if (next.length === current.length) return false;
    writeAll(next);
    return true;
  },
};
