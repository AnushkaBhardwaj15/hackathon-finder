export const HACKATHON_STATUSES = [
  "interested",
  "registered",
  "building",
  "submitted",
  "completed",
] as const;

export type HackathonStatus = (typeof HACKATHON_STATUSES)[number];

export const DEADLINE_TYPES = [
  "registration",
  "team-formation",
  "idea-submission",
  "prototype",
  "final-submission",
  "results",
  "other",
] as const;

export type DeadlineType = (typeof DEADLINE_TYPES)[number];

export type Urgency = "normal" | "warning" | "urgent" | "overdue" | "completed";

export interface Deadline {
  id: string;
  title: string;
  type: DeadlineType;
  dateTime: string;
  completed: boolean;
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
}

export interface Hackathon {
  id: string;
  name: string;
  organizer: string;
  platform: string;
  description: string;
  status: HackathonStatus;
  registrationUrl: string;
  rulesUrl: string;
  submissionUrl: string;
  resultsUrl: string;
  discordUrl: string;
  githubUrl: string;
  projectUrl: string;
  demoUrl: string;
  notes: string;
  deadlines: Deadline[];
  requirements: Requirement[];
  createdAt: string;
  updatedAt: string;
}

export type HackathonDraft = Omit<Hackathon, "id" | "createdAt" | "updatedAt">;

export interface HackathonLinks {
  registrationUrl: string;
  rulesUrl: string;
  submissionUrl: string;
  resultsUrl: string;
  discordUrl: string;
  githubUrl: string;
  projectUrl: string;
  demoUrl: string;
}
