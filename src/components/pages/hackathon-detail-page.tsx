"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteButton } from "@/components/confirm-delete";
import { Countdown } from "@/components/countdown";
import { DeadlineItem } from "@/components/deadline-item";
import { ProgressIndicator } from "@/components/progress-indicator";
import { QuickLinks } from "@/components/quick-links";
import { RequirementItem } from "@/components/requirement-item";
import { StatusBadge } from "@/components/status-badge";
import { useHackathon } from "@/hooks/use-hackathons";
import { useNow } from "@/hooks/use-now";
import { getCountdownInfo, getNearestIncompleteDeadline } from "@/lib/countdown";
import { combineLocalDateTime, formatDateTime } from "@/lib/dates";
import { DEADLINE_TYPE_LABELS } from "@/lib/labels";
import { DEADLINE_TYPES, type DeadlineType } from "@/lib/types";

export function HackathonDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const now = useNow();
  const {
    hackathon,
    hydrated,
    remove,
    setDeadlineCompleted,
    addDeadline,
    removeDeadline,
    setRequirementCompleted,
    addRequirement,
    removeRequirement,
    updateNotes,
  } = useHackathon(id);
  const [notes, setNotes] = useState<string | null>(null);
  const [deadlineOpen, setDeadlineOpen] = useState(false);
  const [requirementOpen, setRequirementOpen] = useState(false);

  const sortedDeadlines = useMemo(() => {
    if (!hackathon) return [];
    return [...hackathon.deadlines].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );
  }, [hackathon]);

  if (!hydrated) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
  }

  if (!hackathon) {
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

  const nearest = getNearestIncompleteDeadline(hackathon.deadlines);
  const nearestInfo = nearest ? getCountdownInfo(nearest.dateTime, now, nearest.completed) : null;
  const completedDeadlines = hackathon.deadlines.filter((item) => item.completed).length;
  const completedRequirements = hackathon.requirements.filter((item) => item.completed).length;
  const notesValue = notes ?? hackathon.notes;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{hackathon.name}</h1>
            <StatusBadge status={hackathon.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {[hackathon.organizer, hackathon.platform].filter(Boolean).join(" · ") || "No organizer or platform listed"}
          </p>
          {hackathon.description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6">{hackathon.description}</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href={`/hackathons/${hackathon.id}/edit`} />}>
            <Pencil />
            Edit
          </Button>
          <ConfirmDeleteButton
            title="Delete this hackathon?"
            description="This removes it from this browser. You cannot undo this."
            onConfirm={() => {
              remove(hackathon.id);
              router.push("/hackathons");
            }}
          />
        </div>
      </div>

      {nearest && nearestInfo ? (
        <section className="rounded-xl border border-urgent/20 bg-urgent/5 p-5">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-urgent">
            <Flame className="size-4" />
            Next deadline
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{nearest.title}</h2>
          <p className="mt-1 text-muted-foreground">{formatDateTime(nearest.dateTime)}</p>
          <div className="mt-3">
            <Countdown dateTime={nearest.dateTime} completed={nearest.completed} />
          </div>
        </section>
      ) : (
        <section className="rounded-xl border bg-card px-5 py-6 text-sm text-muted-foreground">
          You&apos;re all clear 🎉 No incomplete deadlines left on this hackathon.
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Deadlines</h2>
          <Button variant="outline" size="sm" onClick={() => setDeadlineOpen(true)}>
            <Plus />
            Add deadline
          </Button>
        </div>
        {sortedDeadlines.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            No deadlines yet.
          </p>
        ) : (
          <div className="space-y-2">
            {sortedDeadlines.map((deadline) => (
              <DeadlineItem
                key={deadline.id}
                deadline={deadline}
                onToggle={(completed) => setDeadlineCompleted(hackathon.id, deadline.id, completed)}
                onDelete={() => removeDeadline(hackathon.id, deadline.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Requirements</h2>
            <p className="text-sm text-muted-foreground">
              {completedRequirements} / {hackathon.requirements.length} completed
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setRequirementOpen(true)}>
            <Plus />
            Add requirement
          </Button>
        </div>
        <ProgressIndicator
          label="Requirements"
          completed={completedRequirements}
          total={hackathon.requirements.length}
        />
        {hackathon.requirements.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            No requirements yet.
          </p>
        ) : (
          <div className="space-y-2">
            {hackathon.requirements.map((requirement) => (
              <RequirementItem
                key={requirement.id}
                requirement={requirement}
                onToggle={(completed) =>
                  setRequirementCompleted(hackathon.id, requirement.id, completed)
                }
                onDelete={() => removeRequirement(hackathon.id, requirement.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Quick links</h2>
        <QuickLinks hackathon={hackathon} />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <ProgressIndicator
            label="Deadlines"
            completed={completedDeadlines}
            total={hackathon.deadlines.length}
          />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <ProgressIndicator
            label="Requirements"
            completed={completedRequirements}
            total={hackathon.requirements.length}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Notes</h2>
        <Textarea
          value={notesValue}
          onChange={(event) => setNotes(event.target.value)}
          onBlur={() => {
            if (notesValue !== hackathon.notes) {
              updateNotes(hackathon.id, notesValue);
            }
          }}
          placeholder="Need to build agent + RAG. Team: XYZ. Use Gemini API."
          rows={6}
        />
      </section>

      <AddDeadlineDialog
        open={deadlineOpen}
        onOpenChange={setDeadlineOpen}
        onSave={(deadline) => {
          addDeadline(hackathon.id, deadline);
          setDeadlineOpen(false);
        }}
      />
      <AddRequirementDialog
        open={requirementOpen}
        onOpenChange={setRequirementOpen}
        onSave={(requirement) => {
          addRequirement(hackathon.id, requirement);
          setRequirementOpen(false);
        }}
      />
    </div>
  );
}

function AddDeadlineDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (deadline: {
    title: string;
    type: DeadlineType;
    dateTime: string;
    completed: boolean;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DeadlineType>("final-submission");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("23:59");
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setTitle("");
    setType("final-submission");
    setDate("");
    setTime("23:59");
    setCompleted(false);
    setError("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add deadline</DialogTitle>
          <DialogDescription>Use your local date and time.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label className="mb-1.5">Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Final Submission" />
          </div>
          <div>
            <Label className="mb-1.5">Type</Label>
            <Select value={type} onValueChange={(value) => value && setType(value as DeadlineType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEADLINE_TYPES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {DEADLINE_TYPE_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">Date</Label>
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5">Time</Label>
              <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={completed} onCheckedChange={(checked) => setCompleted(checked === true)} />
            Completed
          </label>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              if (!title.trim() || !date || !time) {
                setError("Title, date, and time are required.");
                return;
              }
              onSave({
                title: title.trim(),
                type,
                dateTime: combineLocalDateTime(date, time),
                completed,
              });
              reset();
            }}
          >
            Add deadline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddRequirementDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (requirement: {
    title: string;
    description: string;
    required: boolean;
    completed: boolean;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [required, setRequired] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setTitle("");
    setDescription("");
    setRequired(true);
    setCompleted(false);
    setError("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add requirement</DialogTitle>
          <DialogDescription>Keep the submission checklist visible.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label className="mb-1.5">Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="GitHub repository" />
          </div>
          <div>
            <Label className="mb-1.5">Description</Label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Public repo with README and setup steps."
              rows={3}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={required} onCheckedChange={(checked) => setRequired(checked === true)} />
            Required
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={completed} onCheckedChange={(checked) => setCompleted(checked === true)} />
            Completed
          </label>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              if (!title.trim()) {
                setError("Title is required.");
                return;
              }
              onSave({
                title: title.trim(),
                description: description.trim(),
                required,
                completed,
              });
              reset();
            }}
          >
            Add requirement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
