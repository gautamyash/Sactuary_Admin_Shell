import { Badge, type BadgeVariant } from "@/components/ui/badge";

const MAP: Record<string, { variant: BadgeVariant; label: string }> = {
  confirmed: { variant: "success", label: "Confirmed" },
  pending: { variant: "default", label: "Pending" },
  completed: { variant: "secondary", label: "Completed" },
  cancelled: { variant: "destructive", label: "Cancelled" },
};

export function AppointmentStatusBadge({ status }: { status: string }) {
  const cfg = MAP[status] ?? { variant: "secondary" as BadgeVariant, label: status };
  return (
    <Badge variant={cfg.variant}>
      <span className="size-1.5 rounded-full bg-current" />
      {cfg.label}
    </Badge>
  );
}
