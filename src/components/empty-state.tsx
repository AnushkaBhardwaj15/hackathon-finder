import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed bg-card px-6 py-12 text-center">
      <p className="text-lg font-medium">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Button className="mt-5" nativeButton={false} render={<Link href={actionHref} />}>
          <Plus />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
