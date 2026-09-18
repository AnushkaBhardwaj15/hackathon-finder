"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import type { Requirement } from "@/lib/types";

export function RequirementItem({
  requirement,
  onToggle,
  onDelete,
}: {
  requirement: Requirement;
  onToggle?: (completed: boolean) => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border px-3 py-3">
      {onToggle ? (
        <Checkbox
          checked={requirement.completed}
          onCheckedChange={(checked) => onToggle(checked === true)}
          className="mt-0.5"
          aria-label={`Mark ${requirement.title} complete`}
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("font-medium", requirement.completed && "text-muted-foreground line-through")}>
            {requirement.title}
          </p>
          {requirement.required ? (
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Required
            </span>
          ) : null}
        </div>
        {requirement.description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{requirement.description}</p>
        ) : null}
      </div>
      {onDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          aria-label={`Delete ${requirement.title}`}
        >
          <Trash2 />
        </Button>
      ) : null}
    </div>
  );
}
