import { Badge, type BadgeVariant } from "@/components/ui/badge";

const MAP: Record<string, { variant: BadgeVariant; label: string }> = {
  paid: { variant: "success", label: "Paid" },
  pending: { variant: "warning", label: "Pending" },
  draft: { variant: "secondary", label: "Draft" },
  cancelled: { variant: "destructive", label: "Cancelled" },
  refunded: { variant: "outline", label: "Refunded" },
};

export function InvoiceStatusBadge({ status }: { status: string }) {
  const cfg = MAP[status] ?? { variant: "secondary" as BadgeVariant, label: status };
  return (
    <Badge variant={cfg.variant}>
      <span className="size-1.5 rounded-full bg-current" />
      {cfg.label}
    </Badge>
  );
}
