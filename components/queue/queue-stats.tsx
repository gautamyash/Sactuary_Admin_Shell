"use client";

import { Clock3, ListOrdered, TimerReset, Users } from "lucide-react";

import { useQueueAnalytics } from "@/components/queue/queries";
import { StatCard } from "@/components/dashboard/stat-card";

/** KPI row for the selected day/doctor, sourced entirely from
 * GET /api/analytics/queue/ (no fabricated figures). */
export function QueueStats({ date, doctorId }: { date: string; doctorId?: string }) {
  const { data, isLoading, isError, error, refetch } = useQueueAnalytics(date, doctorId);
  void error;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Patients Seen"
        icon={Users}
        loading={isLoading}
        error={isError}
        value={data ? String(data.patientsSeenToday) : undefined}
        hint="Completed consultations"
        hintTone="muted"
      />
      <StatCard
        label="Avg Wait Time"
        icon={Clock3}
        loading={isLoading}
        error={isError}
        value={data ? `${Math.round(data.averageWaitTime)} min` : undefined}
        accent={!!data && data.averageWaitTime >= 20}
        hint="Per patient today"
        hintTone="muted"
      />
      <StatCard
        label="Avg Doctor Delay"
        icon={TimerReset}
        loading={isLoading}
        error={isError}
        value={data ? `${Math.round(data.averageDelay)} min` : undefined}
        accent={!!data && data.averageDelay >= 15}
        hint="Behind schedule"
        hintTone="muted"
      />
      <StatCard
        label="Avg Queue Length"
        icon={ListOrdered}
        loading={isLoading}
        error={isError}
        value={data ? data.averageQueueLength.toFixed(1) : undefined}
        hint={
          data?.consultationPunctuality != null
            ? `${Math.round(data.consultationPunctuality * 100)}% on-time starts`
            : "Waiting + in-progress"
        }
        hintTone="muted"
      />
      {isError && (
        <button
          onClick={() => refetch()}
          className="col-span-full text-left text-xs text-muted-foreground hover:text-primary"
        >
          Retry loading queue analytics
        </button>
      )}
    </div>
  );
}
