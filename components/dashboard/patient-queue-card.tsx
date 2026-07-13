"use client";

import { useMemo } from "react";

import { useTodayAppointments } from "@/components/dashboard/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function statusVariant(status: string) {
  if (status === "in_progress") return "default" as const;
  if (status === "completed") return "success" as const;
  if (status === "cancelled") return "destructive" as const;
  return "secondary" as const;
}

export function PatientQueueCard() {
  const { data, isLoading, isError, error, refetch } = useTodayAppointments();

  const rows = useMemo(
    () =>
      (data ?? [])
        .filter((a) => a.status !== "cancelled")
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 6),
    [data],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Queue</CardTitle>
        <Badge variant="success">LIVE</Badge>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <LoadingScreen label="Loading queue…" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No appointments in the queue.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-medium">Doctor</th>
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 text-right font-medium">Queue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((a) => (
                <tr key={a.id}>
                  <td className="py-2.5">
                    <p className="font-medium text-foreground">{a.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{a.specialty}</p>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{a.timeLabel}</td>
                  <td className="py-2.5">
                    <Badge variant={statusVariant(a.status)}>
                      {a.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-right text-muted-foreground">
                    {a.queuePosition ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-3 text-xs text-muted-foreground/70">
          Patient identity and live wait times require a hospital-wide queue endpoint
          (not available); showing today&apos;s appointment queue.
        </p>
      </CardContent>
    </Card>
  );
}
