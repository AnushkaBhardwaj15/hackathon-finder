import type { DeadlineType, HackathonStatus } from "@/lib/types";

export const STATUS_LABELS: Record<HackathonStatus, string> = {
  interested: "Interested",
  registered: "Registered",
  building: "Building",
  submitted: "Submitted",
  completed: "Completed",
};

export const DEADLINE_TYPE_LABELS: Record<DeadlineType, string> = {
  registration: "Registration",
  "team-formation": "Team formation",
  "idea-submission": "Idea submission",
  prototype: "Prototype",
  "final-submission": "Final submission",
  results: "Results",
  other: "Other",
};

export const USER_NAME = "Anushka";
