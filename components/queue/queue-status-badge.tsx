import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { QueueRowState } from "@/lib/api/queue";

const MAP: Record<QueueRowState, { variant: BadgeVariant; label: string }> = {
  in_progress: { variant: "default", label: "In Progress" },
  waiting: { variant: "warning", label: "Waiting" },
  completed: { variant: "success", label: "Completed" },
};

export function QueueRowStateBadge({ state }: { state: QueueRowState }) {
  const cfg = MAP[state] ?? { variant: "secondary" as BadgeVariant, label: state };
  return (
    <Badge variant={cfg.variant}>
      <span className="size-1.5 rounded-full bg-current" />
      {cfg.label}
    </Badge>
  );
}
