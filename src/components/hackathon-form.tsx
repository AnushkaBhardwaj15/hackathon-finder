"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createId } from "@/lib/ids";
import { combineLocalDateTime, toLocalDateInput, toLocalTimeInput } from "@/lib/dates";
import { DEADLINE_TYPE_LABELS, STATUS_LABELS } from "@/lib/labels";
import { isValidUrl, normalizeUrl } from "@/lib/urls";
import { DEADLINE_TYPES, HACKATHON_STATUSES } from "@/lib/types";
import type { DeadlineType, Hackathon, HackathonDraft, HackathonStatus } from "@/lib/types";

interface DeadlineDraft {
  key: string;
  title: string;
  type: DeadlineType;
  date: string;
  time: string;
  completed: boolean;
}

interface RequirementDraft {
  key: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
}

interface FormErrors {
  name?: string;
  links?: Record<string, string>;
  deadlines?: Record<string, string>;
  requirements?: Record<string, string>;
}

const LINK_FIELDS = [
  { key: "registrationUrl", label: "Registration URL" },
  { key: "rulesUrl", label: "Rules URL" },
  { key: "submissionUrl", label: "Submission URL" },
  { key: "resultsUrl", label: "Results URL" },
  { key: "discordUrl", label: "Discord / community URL" },
  { key: "githubUrl", label: "GitHub URL" },
  { key: "projectUrl", label: "Project URL" },
  { key: "demoUrl", label: "Demo URL" },
] as const;

type LinkKey = (typeof LINK_FIELDS)[number]["key"];

function emptyLinks(): Record<LinkKey, string> {
  return {
    registrationUrl: "",
    rulesUrl: "",
    submissionUrl: "",
    resultsUrl: "",
    discordUrl: "",
    githubUrl: "",
    projectUrl: "",
    demoUrl: "",
  };
}

function draftsFromHackathon(hackathon?: Hackathon) {
  return {
    name: hackathon?.name ?? "",
    organizer: hackathon?.organizer ?? "",
    platform: hackathon?.platform ?? "",
    description: hackathon?.description ?? "",
    status: (hackathon?.status ?? "registered") as HackathonStatus,
    links: {
      ...emptyLinks(),
      registrationUrl: hackathon?.registrationUrl ?? "",
      rulesUrl: hackathon?.rulesUrl ?? "",
      submissionUrl: hackathon?.submissionUrl ?? "",
      resultsUrl: hackathon?.resultsUrl ?? "",
      discordUrl: hackathon?.discordUrl ?? "",
      githubUrl: hackathon?.githubUrl ?? "",
      projectUrl: hackathon?.projectUrl ?? "",
      demoUrl: hackathon?.demoUrl ?? "",
    },
    notes: hackathon?.notes ?? "",
    deadlines:
      hackathon?.deadlines.map((deadline) => ({
        key: deadline.id,
        title: deadline.title,
        type: deadline.type,
        date: toLocalDateInput(deadline.dateTime),
        time: toLocalTimeInput(deadline.dateTime) || "23:59",
        completed: deadline.completed,
      })) ?? [],
    requirements:
      hackathon?.requirements.map((requirement) => ({
        key: requirement.id,
        title: requirement.title,
        description: requirement.description,
        required: requirement.required,
        completed: requirement.completed,
      })) ?? [],
  };
}

export function HackathonForm({
  initial,
  onSave,
}: {
  initial?: Hackathon;
  onSave: (draft: HackathonDraft) => Hackathon;
}) {
  const router = useRouter();
  const seed = useMemo(() => draftsFromHackathon(initial), [initial]);
  const [name, setName] = useState(seed.name);
  const [organizer, setOrganizer] = useState(seed.organizer);
  const [platform, setPlatform] = useState(seed.platform);
  const [description, setDescription] = useState(seed.description);
  const [status, setStatus] = useState<HackathonStatus>(seed.status);
  const [links, setLinks] = useState(seed.links);
  const [notes, setNotes] = useState(seed.notes);
  const [deadlines, setDeadlines] = useState<DeadlineDraft[]>(seed.deadlines);
  const [requirements, setRequirements] = useState<RequirementDraft[]>(seed.requirements);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  function addDeadline() {
    setDeadlines((current) => [
      ...current,
      {
        key: createId(),
        title: "",
        type: "final-submission",
        date: "",
        time: "23:59",
        completed: false,
      },
    ]);
  }

  function addRequirement() {
    setRequirements((current) => [
      ...current,
      {
        key: createId(),
        title: "",
        description: "",
        required: true,
        completed: false,
      },
    ]);
  }

  function validate(): boolean {
    const next: FormErrors = { links: {}, deadlines: {}, requirements: {} };

    if (!name.trim()) {
      next.name = "Hackathon name is required.";
    }

    for (const field of LINK_FIELDS) {
      if (!isValidUrl(links[field.key])) {
        next.links![field.key] = "Enter a valid http(s) URL.";
      }
    }

    deadlines.forEach((deadline) => {
      if (!deadline.title.trim() || !deadline.date || !deadline.time) {
        next.deadlines![deadline.key] = "Title, date, and time are required.";
      }
    });

    requirements.forEach((requirement) => {
      if (!requirement.title.trim()) {
        next.requirements![requirement.key] = "Title is required.";
      }
    });

    const hasLinkErrors = Object.keys(next.links ?? {}).length > 0;
    const hasDeadlineErrors = Object.keys(next.deadlines ?? {}).length > 0;
    const hasRequirementErrors = Object.keys(next.requirements ?? {}).length > 0;
    if (!next.name && !hasLinkErrors && !hasDeadlineErrors && !hasRequirementErrors) {
      setErrors({});
      return true;
    }

    setErrors(next);
    return false;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const draft: HackathonDraft = {
      name: name.trim(),
      organizer: organizer.trim(),
      platform: platform.trim(),
      description: description.trim(),
      status,
      registrationUrl: normalizeUrl(links.registrationUrl),
      rulesUrl: normalizeUrl(links.rulesUrl),
      submissionUrl: normalizeUrl(links.submissionUrl),
      resultsUrl: normalizeUrl(links.resultsUrl),
      discordUrl: normalizeUrl(links.discordUrl),
      githubUrl: normalizeUrl(links.githubUrl),
      projectUrl: normalizeUrl(links.projectUrl),
      demoUrl: normalizeUrl(links.demoUrl),
      notes: notes.trim(),
      deadlines: deadlines.map((deadline) => ({
        id: deadline.key,
        title: deadline.title.trim(),
        type: deadline.type,
        dateTime: combineLocalDateTime(deadline.date, deadline.time),
        completed: deadline.completed,
      })),
      requirements: requirements.map((requirement) => ({
        id: requirement.key,
        title: requirement.title.trim(),
        description: requirement.description.trim(),
        required: requirement.required,
        completed: requirement.completed,
      })),
    };

    const saved = onSave(draft);
    router.push(`/hackathons/${saved.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Basic information</h2>
          <p className="text-sm text-muted-foreground">What are you entering, and where does it stand?</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hackathon name" required error={errors.name} className="sm:col-span-2">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="MLH Hackathon 2026"
              aria-invalid={Boolean(errors.name)}
            />
          </Field>
          <Field label="Organizer">
            <Input value={organizer} onChange={(event) => setOrganizer(event.target.value)} placeholder="MLH" />
          </Field>
          <Field label="Platform">
            <Input
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              placeholder="Devpost, Unstop, DoraHacks..."
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short reminder of the theme, prize, or why you joined."
              rows={4}
            />
          </Field>
          <Field label="Status">
            <Select value={status} onValueChange={(value) => value && setStatus(value as HackathonStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HACKATHON_STATUSES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {STATUS_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Important links</h2>
          <p className="text-sm text-muted-foreground">Only filled links will appear later.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {LINK_FIELDS.map((field) => (
            <Field key={field.key} label={field.label} error={errors.links?.[field.key]}>
              <Input
                value={links[field.key]}
                onChange={(event) =>
                  setLinks((current) => ({ ...current, [field.key]: event.target.value }))
                }
                placeholder="https://"
                inputMode="url"
                aria-invalid={Boolean(errors.links?.[field.key])}
              />
            </Field>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Deadlines</h2>
            <p className="text-sm text-muted-foreground">
              Registration, team formation, prototype, final submission, results...
            </p>
          </div>
          <Button type="button" variant="outline" onClick={addDeadline}>
            <Plus />
            Add deadline
          </Button>
        </div>
        {deadlines.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            No deadlines yet. Add the dates you cannot afford to miss.
          </p>
        ) : (
          <div className="space-y-3">
            {deadlines.map((deadline) => (
              <div key={deadline.key} className="space-y-3 rounded-xl border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Title" error={errors.deadlines?.[deadline.key]} className="sm:col-span-2">
                    <Input
                      value={deadline.title}
                      onChange={(event) =>
                        setDeadlines((current) =>
                          current.map((item) =>
                            item.key === deadline.key ? { ...item, title: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder="Final Submission"
                    />
                  </Field>
                  <Field label="Type">
                    <Select
                      value={deadline.type}
                      onValueChange={(value) =>
                        value &&
                        setDeadlines((current) =>
                          current.map((item) =>
                            item.key === deadline.key
                              ? { ...item, type: value as DeadlineType }
                              : item,
                          ),
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEADLINE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {DEADLINE_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Completed">
                    <label className="flex h-8 items-center gap-2 text-sm">
                      <Checkbox
                        checked={deadline.completed}
                        onCheckedChange={(checked) =>
                          setDeadlines((current) =>
                            current.map((item) =>
                              item.key === deadline.key
                                ? { ...item, completed: checked === true }
                                : item,
                            ),
                          )
                        }
                      />
                      Done
                    </label>
                  </Field>
                  <Field label="Date">
                    <Input
                      type="date"
                      value={deadline.date}
                      onChange={(event) =>
                        setDeadlines((current) =>
                          current.map((item) =>
                            item.key === deadline.key ? { ...item, date: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="Time">
                    <Input
                      type="time"
                      value={deadline.time}
                      onChange={(event) =>
                        setDeadlines((current) =>
                          current.map((item) =>
                            item.key === deadline.key ? { ...item, time: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </Field>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDeadlines((current) => current.filter((item) => item.key !== deadline.key))
                    }
                  >
                    <Trash2 />
                    Remove deadline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Requirements</h2>
            <p className="text-sm text-muted-foreground">
              GitHub repo, README, demo video, pitch deck, screenshots...
            </p>
          </div>
          <Button type="button" variant="outline" onClick={addRequirement}>
            <Plus />
            Add requirement
          </Button>
        </div>
        {requirements.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            No requirements yet. Turn the submission checklist into boxes you can tick.
          </p>
        ) : (
          <div className="space-y-3">
            {requirements.map((requirement) => (
              <div key={requirement.key} className="space-y-3 rounded-xl border p-4">
                <Field label="Title" error={errors.requirements?.[requirement.key]}>
                  <Input
                    value={requirement.title}
                    onChange={(event) =>
                      setRequirements((current) =>
                        current.map((item) =>
                          item.key === requirement.key ? { ...item, title: event.target.value } : item,
                        ),
                      )
                    }
                    placeholder="Demo video"
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    value={requirement.description}
                    onChange={(event) =>
                      setRequirements((current) =>
                        current.map((item) =>
                          item.key === requirement.key
                            ? { ...item, description: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="2-minute walkthrough uploaded to YouTube or Drive."
                    rows={2}
                  />
                </Field>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={requirement.required}
                        onCheckedChange={(checked) =>
                          setRequirements((current) =>
                            current.map((item) =>
                              item.key === requirement.key
                                ? { ...item, required: checked === true }
                                : item,
                            ),
                          )
                        }
                      />
                      Required
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={requirement.completed}
                        onCheckedChange={(checked) =>
                          setRequirements((current) =>
                            current.map((item) =>
                              item.key === requirement.key
                                ? { ...item, completed: checked === true }
                                : item,
                            ),
                          )
                        }
                      />
                      Completed
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setRequirements((current) =>
                        current.filter((item) => item.key !== requirement.key),
                      )
                    }
                  >
                    <Trash2 />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Notes</h2>
          <p className="text-sm text-muted-foreground">Anything you need to remember later.</p>
        </div>
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Need to build agent + RAG. Team: XYZ. Use Gemini API."
          rows={6}
        />
      </section>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving}>
          {initial ? "Save changes" : "Save hackathon"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5">
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
