import {
  ExternalLink,
  FileText,
  GitBranch,
  Globe,
  Link2,
  MessageCircle,
  Play,
  Send,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasLink } from "@/lib/urls";
import type { Hackathon } from "@/lib/types";

const LINK_ITEMS = [
  { key: "registrationUrl", label: "Register", icon: Globe },
  { key: "rulesUrl", label: "Rules", icon: FileText },
  { key: "submissionUrl", label: "Submit", icon: Send },
  { key: "resultsUrl", label: "Results", icon: Trophy },
  { key: "discordUrl", label: "Discord", icon: MessageCircle },
  { key: "githubUrl", label: "GitHub", icon: GitBranch },
  { key: "projectUrl", label: "Project", icon: Link2 },
  { key: "demoUrl", label: "Demo", icon: Play },
] as const;

export function QuickLinks({ hackathon }: { hackathon: Hackathon }) {
  const links = LINK_ITEMS.filter((item) => hasLink(hackathon[item.key]));

  if (links.length === 0) {
    return <p className="text-sm text-muted-foreground">No links added yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <Button key={item.key} variant="outline" size="sm" nativeButton={false} render={<a href={hackathon[item.key]} target="_blank" rel="noopener noreferrer" />}>
            <Icon />
            {item.label}
            <ExternalLink className="size-3.5 opacity-60" />
          </Button>
        );
      })}
    </div>
  );
}
