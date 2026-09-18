import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That hackathon is not in this browser yet.
      </p>
      <Button className="mt-5" nativeButton={false} render={<Link href="/hackathons" />}>
        Back to hackathons
      </Button>
    </div>
  );
}
