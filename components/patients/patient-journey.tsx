"use client";

import { ClipboardList, FlaskConical, Paperclip, Pill, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { usePatientTimeline, usePatientVisits } from "@/components/patients/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MedicalVisit, TimelineEvent } from "@/lib/api/records";

function stageIcon(stage: string) {
  const s = stage.toLowerCase();
  if (s.includes("lab") || s.includes("report")) return FlaskConical;
  if (s.includes("prescription") || s.includes("medic")) return Pill;
  if (s.includes("visit") || s.includes("consult")) return Stethoscope;
  return ClipboardList;
}

function formatTs(ts: string | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PatientJourney({ id }: { id: number }) {
  const timeline = usePatientTimeline(id);
  const visits = usePatientVisits(id);
  const [stageFilter, setStageFilter] = useState("");

  const visitById = useMemo(() => {
    const map = new Map<number, MedicalVisit>();
    for (const v of visits.data ?? []) map.set(v.id, v);
    return map;
  }, [visits.data]);

  const stages = useMemo(
    () => Array.from(new Set((timeline.data ?? []).map((e) => e.stage))),
    [timeline.data],
  );

  const events: TimelineEvent[] = useMemo(
    () =>
      (timeline.data ?? []).filter((e) => !stageFilter || e.stage === stageFilter),
    [timeline.data, stageFilter],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Journey</CardTitle>
        <div className="flex items-center gap-2">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring"
          >
            <option value="">All Events</option>
            {stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Export isn't available yet.")}
          >
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {timeline.isLoading ? (
          <LoadingScreen label="Loading journey…" />
        ) : timeline.isError ? (
          <ErrorState error={timeline.error} onRetry={() => timeline.refetch()} />
        ) : events.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No events in this patient&apos;s journey.
          </p>
        ) : (
          <ol className="relative space-y-6 border-l border-border pl-6">
            {events.map((e, i) => {
              const Icon = stageIcon(e.stage);
              const visit = visitById.get(e.visitId);
              return (
                <li key={`${e.visitId}-${i}`} className="relative">
                  <span className="absolute -left-[31px] flex size-8 items-center justify-center rounded-full border border-border bg-card text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{e.title}</p>
                        {visit && (
                          <p className="text-sm text-muted-foreground">
                            {visit.specialty} · Dr. {visit.doctorName}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatTs(e.timestamp)}
                      </span>
                    </div>

                    {e.detail && <p className="mt-2 text-sm text-foreground">{e.detail}</p>}
                    {visit?.clinicalNotes && (
                      <p className="mt-2 text-sm text-muted-foreground">{visit.clinicalNotes}</p>
                    )}

                    {visit && visit.prescriptions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {visit.prescriptions.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary"
                          >
                            <Pill className="size-3" />
                            {p.medicine}
                            {p.dosage ? ` · ${p.dosage}` : ""}
                          </span>
                        ))}
                      </div>
                    )}

                    {visit && visit.reports.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {visit.reports.map((r) => {
                          const inner = (
                            <>
                              <Paperclip className="size-3" />
                              {r.title}
                            </>
                          );
                          return r.fileUrl ? (
                            <a
                              key={r.id}
                              href={r.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-muted"
                            >
                              {inner}
                            </a>
                          ) : (
                            <span
                              key={r.id}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
                            >
                              {inner}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
