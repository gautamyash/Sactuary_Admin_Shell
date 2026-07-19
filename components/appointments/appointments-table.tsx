"use client";

import { ChevronLeft, ChevronRight, MoreVertical, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAppointments } from "@/components/appointments/queries";
import { AppointmentStatusBadge } from "@/components/appointments/status-badge";
import type { AppliedFilters } from "@/components/appointments/types";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PAGE_SIZE = 10;

function formatDate(dateISO: string): string {
  const d = new Date(`${dateISO}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AppointmentsTable({ filters }: { filters: AppliedFilters }) {
  const { data, isLoading, isError, error, refetch } = useAppointments({
    status: filters.status || undefined,
    doctor: filters.doctorId || undefined,
  });
  const [page, setPage] = useState(1);

  // Department has no server param — refine client-side.
  const rows = useMemo(
    () =>
      (data ?? []).filter((a) => !filters.department || a.specialty === filters.department),
    [data, filters.department],
  );

  const pageResetDeps = [filters, data];
  const [prevPageResetDeps, setPrevPageResetDeps] = useState(pageResetDeps);
  if (pageResetDeps.some((v, i) => !Object.is(v, prevPageResetDeps[i]))) {
    setPrevPageResetDeps(pageResetDeps);
    setPage(1);
  }

  const total = rows.length;
  const start = (page - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);
  const showingFrom = total === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + PAGE_SIZE, total);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments List</CardTitle>
        <span className="text-sm text-muted-foreground">
          Showing {showingFrom}-{showingTo} of {total}
        </span>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <LoadingScreen label="Loading appointments…" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : total === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No appointments match these filters.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-2 py-3 font-medium">Patient</th>
                    <th className="px-2 py-3 font-medium">Doctor</th>
                    <th className="px-2 py-3 font-medium">Date &amp; Time</th>
                    <th className="px-2 py-3 font-medium">Department</th>
                    <th className="px-2 py-3 font-medium">Status</th>
                    <th className="px-2 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageRows.map((a) => (
                    <tr key={a.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={a.patientName} className="size-9" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{a.patientName}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {a.patientReference ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2 text-foreground">
                          <Stethoscope className="size-4 text-muted-foreground" />
                          {a.doctorName}
                        </div>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground">
                        <p className="text-foreground">{formatDate(a.date)}</p>
                        <p className="text-xs">{a.timeLabel}</p>
                      </td>
                      <td className="px-2 py-3">
                        <Badge variant="secondary">{a.specialty}</Badge>
                      </td>
                      <td className="px-2 py-3">
                        <AppointmentStatusBadge status={a.status} />
                      </td>
                      <td className="px-2 py-3 text-right">
                        <button
                          type="button"
                          aria-label="Row actions"
                          onClick={() => toast.info("Row actions aren't available yet.")}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                        >
                          <MoreVertical className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={showingTo >= total}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
