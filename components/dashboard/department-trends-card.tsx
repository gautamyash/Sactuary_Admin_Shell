"use client";

import { useMemo } from "react";

import { useTodayAppointments } from "@/components/dashboard/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DepartmentTrendsCard() {
  const { data, isLoading, isError, error, refetch } = useTodayAppointments();

  const trends = useMemo(() => {
    if (!data) return [];
    const counts = new Map<string, number>();
    for (const a of data) counts.set(a.specialty, (counts.get(a.specialty) ?? 0) + 1);
    const total = data.length || 1;
    return [...counts.entries()]
      .map(([name, count]) => ({ name, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingScreen label="Loading…" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : trends.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No appointments today.
          </p>
        ) : (
          <div className="space-y-4">
            {trends.map((t) => (
              <div key={t.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{t.name}</span>
                  <span className="text-muted-foreground">{t.pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
            <p className="pt-1 text-xs text-muted-foreground/70">
              Share of today&apos;s appointments by specialty.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
