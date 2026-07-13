import { Badge } from "@/components/ui/badge";

export function DoctorStatusBadge({ onDuty, onLeave }: { onDuty: boolean; onLeave: boolean }) {
  if (onLeave) {
    return (
      <Badge variant="warning">
        <span className="size-1.5 rounded-full bg-current" />
        On-leave
      </Badge>
    );
  }
  if (onDuty) {
    return (
      <Badge variant="success">
        <span className="size-1.5 rounded-full bg-current" />
        On-duty
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      <span className="size-1.5 rounded-full bg-current" />
      Off-duty
    </Badge>
  );
}
