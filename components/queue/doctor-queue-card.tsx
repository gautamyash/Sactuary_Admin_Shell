"use client";

import { CheckCircle2, Play } from "lucide-react";
import { toast } from "sonner";

import { useStartConsultation } from "@/components/queue/queries";
import { QueueRowStateBadge } from "@/components/queue/queue-status-badge";
import { formatTime, formatTimeISO } from "@/components/queue/types";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { PermissionGate } from "@/components/common/permission-gate";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Doctor } from "@/lib/api/doctors";
import type { DoctorQueue } from "@/lib/api/queue";
import { ApiError } from "@/lib/api/errors";

export function DoctorQueueCard({
  doctor,
  queue,
  isLoading,
  isError,
  onRetry,
}: {
  doctor: Doctor;
  queue: DoctorQueue | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const startConsultation = useStartConsultation();

  const nextWaitingId = queue?.timeline.find((r) => r.state === "waiting")?.appointmentId;

  async function handleStart(appointmentId: number) {
    try {
      await startConsultation.mutateAsync(appointmentId);
      toast.success("Consultation started.");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not start the consultation.",
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar name={doctor.name} />
          <div className="min-w-0">
            <CardTitle className="truncate">{doctor.name}</CardTitle>
            <p className="truncate text-xs text-muted-foreground">{doctor.specialty}</p>
          </div>
        </div>
        {queue && (
          <Badge variant={queue.doctorRunningLate ? "destructive" : "success"}>
            <span className="size-1.5 rounded-full bg-current" />
            {queue.doctorRunningLate
              ? `Running ${queue.delayMinutes}m late`
              : queue.delayMinutes < 0
                ? `${Math.abs(queue.delayMinutes)}m ahead`
                : "On schedule"}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <LoadingScreen label="Loading queue…" />
        ) : isError ? (
          <ErrorState error={undefined} description="Could not load this doctor's queue." onRetry={onRetry} />
        ) : !queue || queue.timeline.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No appointments scheduled for this day.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {queue.timeline.map((row) => (
              <li key={row.appointmentId} className="flex items-center gap-3 py-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {row.queuePosition ?? <CheckCircle2 className="size-3.5 text-emerald-600" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {row.patientName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Scheduled {formatTime(row.scheduledTime)}
                    {row.state !== "completed" &&
                      ` · Est. ${formatTimeISO(row.estimatedStart)}`}
                    {row.checkedIn && row.state === "waiting" && " · Checked in"}
                  </p>
                </div>
                <QueueRowStateBadge state={row.state} />
                {row.state === "waiting" && row.appointmentId === nextWaitingId && (
                  <PermissionGate permission="queue.manage">
                    <button
                      type="button"
                      title="Start consultation"
                      disabled={startConsultation.isPending}
                      onClick={() => handleStart(row.appointmentId)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary disabled:opacity-50"
                    >
                      <Play className="size-4" />
                    </button>
                  </PermissionGate>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
