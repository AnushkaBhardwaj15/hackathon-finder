"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { REMINDER_OPTIONS } from "@/lib/reminders";
import type { DeadlineReminders } from "@/lib/types";

export function ReminderSettings({
  value,
  onChange,
}: {
  value: DeadlineReminders;
  onChange: (next: DeadlineReminders) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Remind me</p>
      <p className="text-xs text-muted-foreground">
        These are local reminder times. Nothing is sent yet.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {REMINDER_OPTIONS.map((option) => (
          <label key={option.key} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value[option.key]}
              onCheckedChange={(checked) =>
                onChange({ ...value, [option.key]: checked === true })
              }
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}
