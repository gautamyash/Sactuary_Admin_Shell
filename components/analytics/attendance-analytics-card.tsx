"use client";

import {
  AlertTriangle,
  CalendarCheck,
  CalendarX,
  Target,
  TrendingDown,
  UserCog,
} from "lucide-react";

import { useAttendanceAnalytics } from "@/components/dashboard/queries";
import { StatCard } from "@/components/dashboard/stat-card";

/**
 * Full attendance / no-show metrics from the existing attendance analytics
 * endpoint (`/api/analytics/attendance/`). The Dashboard only derives one
 * number from this response ("Attendance Rate" = 100 - no-show rate) — the
 * rest (confirmed/no-show counts, prediction accuracy, predicted no-shows,
 * high-risk count) isn't shown anywhere yet, so this isn't a duplicate.
 */
export function AttendanceAnalyticsCard() {
  const { data, isLoading, isError, error, refetch } = useAttendanceAnalytics();
  void error;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        label="No-show Rate"
        icon={TrendingDown}
        loading={isLoading}
        error={isError}
        value={data ? `${data.averageNoShowRate.toFixed(1)}%` : undefined}
        accent={!!data && data.averageNoShowRate >= 15}
        hint="Average across appointments"
        hintTone="muted"
      />
      <StatCard
        label="High-risk Patients"
        icon={AlertTriangle}
        loading={isLoading}
        error={isError}
        value={data ? String(data.highRiskPatients) : undefined}
        hint="Elevated no-show likelihood"
        hintTone="muted"
      />
      <StatCard
        label="Confirmed Appointments"
        icon={CalendarCheck}
        loading={isLoading}
        error={isError}
        value={data ? String(data.appointmentsConfirmed) : undefined}
        hint="Attended as scheduled"
        hintTone="up"
      />
      <StatCard
        label="No-show Appointments"
        icon={CalendarX}
        loading={isLoading}
        error={isError}
        value={data ? String(data.appointmentsNoShow) : undefined}
        hint="Missed appointments"
        hintTone="muted"
      />
      <StatCard
        label="Prediction Accuracy"
        icon={Target}
        loading={isLoading}
        error={isError}
        value={data ? `${data.predictionAccuracy.toFixed(1)}%` : undefined}
        hint="No-show model accuracy"
        hintTone="up"
      />
      <StatCard
        label="Predicted No-shows"
        icon={UserCog}
        loading={isLoading}
        error={isError}
        value={data ? String(data.predictedNoShows) : undefined}
        hint="Forecast for upcoming appointments"
        hintTone="muted"
      />
      {isError && (
        <button
          onClick={() => refetch()}
          className="col-span-full text-left text-xs text-muted-foreground hover:text-primary"
        >
          Retry loading attendance analytics
        </button>
      )}
    </div>
  );
}
