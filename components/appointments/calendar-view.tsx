"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { useAppointments } from "@/components/appointments/queries";
import type { AppliedFilters } from "@/components/appointments/types";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminAppointment } from "@/lib/api/appointments";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function iso(d: Date): string {
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon=0
  return addDays(x, -day);
}

export function CalendarView({ filters }: { filters: AppliedFilters }) {
  const [mode, setMode] = useState<"month" | "week">("month");
  const [anchor, setAnchor] = useState(() => new Date());

  const days = useMemo(() => {
    if (mode === "week") {
      const start = startOfWeekMonday(anchor);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const gridStart = startOfWeekMonday(first);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [mode, anchor]);

  const rangeStart = iso(days[0]);
  const rangeEnd = iso(days[days.length - 1]);

  const { data, isLoading, isError, error, refetch } = useAppointments({
    dateFrom: rangeStart,
    dateTo: rangeEnd,
    status: filters.status || undefined,
    doctor: filters.doctorId || undefined,
  });

  const byDate = useMemo(() => {
    const map = new Map<string, AdminAppointment[]>();
    for (const a of data ?? []) {
      if (filters.department && a.specialty !== filters.department) continue;
      (map.get(a.date) ?? map.set(a.date, []).get(a.date)!).push(a);
    }
    for (const list of map.values()) list.sort((x, y) => x.time.localeCompare(y.time));
    return map;
  }, [data, filters.department]);

  const title =
    mode === "month"
      ? anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : `${days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  const step = (dir: number) =>
    setAnchor((prev) =>
      mode === "month"
        ? new Date(prev.getFullYear(), prev.getMonth() + dir, 1)
        : addDays(prev, dir * 7),
    );

  const todayIso = iso(new Date());

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-foreground">Calendar View</h2>
            <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
              {(["month", "week"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                    mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => step(-1)}
              aria-label="Previous"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-36 text-center text-sm font-medium text-foreground">{title}</span>
            <button
              onClick={() => step(1)}
              aria-label="Next"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <div className="relative">
            <div className="grid grid-cols-7 border-b border-border pb-2 text-center text-xs font-medium uppercase text-muted-foreground">
              {WEEKDAYS.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
            <div className={cn("grid grid-cols-7", isLoading && "opacity-40")}>
              {days.map((day) => {
                const dIso = iso(day);
                const inMonth = mode === "week" || day.getMonth() === anchor.getMonth();
                const appts = byDate.get(dIso) ?? [];
                return (
                  <div
                    key={dIso}
                    className={cn(
                      "min-h-24 border-b border-r border-border p-1.5 first:border-l",
                      !inMonth && "bg-muted/30",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-1 flex size-6 items-center justify-center rounded-full text-xs",
                        dIso === todayIso
                          ? "bg-primary font-semibold text-primary-foreground"
                          : inMonth
                            ? "text-foreground"
                            : "text-muted-foreground",
                      )}
                    >
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {appts.slice(0, 2).map((a) => (
                        <div
                          key={a.id}
                          title={`${a.timeLabel} · ${a.patientName}`}
                          className="truncate rounded border border-primary/20 bg-primary/10 px-1 py-0.5 text-[10px] text-primary"
                        >
                          {a.timeLabel} · {a.patientName}
                        </div>
                      ))}
                      {appts.length > 2 && (
                        <div className="px-1 text-[10px] text-muted-foreground">
                          +{appts.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingScreen label="Loading calendar…" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
