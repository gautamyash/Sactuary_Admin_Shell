"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { useBillingAnalytics } from "@/components/dashboard/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export function RevenueAnalyticsCard() {
  const { data, isLoading, isError, error, refetch } = useBillingAnalytics();

  const chartData =
    data?.topServices?.map((s) => ({ name: s.description, value: s.total })) ?? [];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Revenue Analytics</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">Revenue by service</p>
        </div>
        <span className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
          All time
        </span>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64">
            <LoadingScreen label="Loading revenue…" />
          </div>
        ) : isError ? (
          <div className="h-64">
            <ErrorState error={error} onRetry={() => refetch()} />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No revenue recorded yet.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  interval={0}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  formatter={(v: number) => money(v)}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="var(--primary)" fillOpacity={i === 0 ? 1 : 0.55} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground/70">
          Daily 7-day series requires a dedicated endpoint (not available); showing the
          real revenue-by-service breakdown instead.
        </p>
      </CardContent>
    </Card>
  );
}
