"use client";

import { useMemo } from "react";

import { useTodayAppointments } from "@/components/appointments/queries";
import { Card } from "@/components/ui/card";

export function AppointmentStats() {
  const { data } = useTodayAppointments();

  const { total, cancelled } = useMemo(() => {
    const rows = data ?? [];
    return {
      total: rows.length,
      cancelled: rows.filter((a) => a.status === "cancelled").length,
    };
  }, [data]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Total Today
        </p>
        <p className="mt-1 text-3xl font-bold text-primary">{data ? total : "—"}</p>
      </Card>
      <Card className="border-destructive/20 bg-destructive/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
          Canceled
        </p>
        <p className="mt-1 text-3xl font-bold text-destructive">
          {data ? String(cancelled).padStart(2, "0") : "—"}
        </p>
      </Card>
    </div>
  );
}
