"use client";

import { Activity, Droplet, HeartPulse, Thermometer } from "lucide-react";
import { useMemo } from "react";

import { usePatientVisits } from "@/components/patients/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CurrentVitalsCard({ id }: { id: number }) {
  const { data, isLoading } = usePatientVisits(id);

  // "Current" vitals = the most recent visit that recorded vitals.
  const latest = useMemo(() => {
    const withVitals = (data ?? [])
      .filter((v) => v.vitals)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return withVitals[0];
  }, [data]);

  const v = latest?.vitals;
  const items = [
    { icon: HeartPulse, label: "Heart Rate", value: v?.pulse != null ? `${v.pulse}` : "—", unit: "bpm" },
    { icon: Activity, label: "B.P.", value: v?.bloodPressure ?? "—", unit: "" },
    { icon: Thermometer, label: "Temp", value: v?.temperature != null ? `${v.temperature}` : "—", unit: "°F" },
    { icon: Droplet, label: "SpO2", value: v?.oxygen != null ? `${v.oxygen}` : "—", unit: "%" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
          Current Vitals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="py-2 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {items.map((it) => (
                <div key={it.label} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <it.icon className="size-3.5 text-primary" />
                    {it.label}
                  </div>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {it.value}
                    {it.unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{it.unit}</span>}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground/70">
              {latest
                ? `Latest recorded ${new Date(`${latest.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : "No vitals recorded yet."}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
