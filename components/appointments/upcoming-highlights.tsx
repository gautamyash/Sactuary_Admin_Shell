"use client";

import { ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { useTodayAppointments } from "@/components/appointments/queries";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UpcomingHighlights() {
  const { data, isLoading } = useTodayAppointments();

  const upcoming = useMemo(
    () =>
      (data ?? [])
        .filter((a) => a.status === "confirmed" || a.status === "pending")
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 4),
    [data],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Upcoming Highlights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        {isLoading ? (
          <p className="py-2 text-sm text-muted-foreground">Loading…</p>
        ) : upcoming.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">No upcoming appointments today.</p>
        ) : (
          upcoming.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <Avatar name={a.patientName} className="size-9" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{a.patientName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.specialty} · {a.timeLabel}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
