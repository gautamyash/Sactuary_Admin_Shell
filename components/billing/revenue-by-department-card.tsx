"use client";

import { useMemo } from "react";
import { toast } from "sonner";

import { useInvoices } from "@/components/billing/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * The Stitch design calls for a "Revenue by Department" breakdown, but the
 * billing analytics endpoint only returns revenue-by-service and
 * revenue-by-payment-method, not by department. Rather than invent an
 * endpoint, this computes the breakdown client-side from the invoices the
 * admin list endpoint already returns (each invoice nests doctor_detail.specialty)
 * — same pattern the Dashboard's Department Trends card uses for appointments.
 */
export function RevenueByDepartmentCard({ className }: { className?: string }) {
  const { data, isLoading, isError, error, refetch } = useInvoices({});

  const breakdown = useMemo(() => {
    if (!data) return [];
    const totals = new Map<string, number>();
    let grandTotal = 0;
    for (const inv of data) {
      if (inv.status === "cancelled" || inv.status === "draft") continue;
      const key = inv.specialty ?? "Unassigned";
      totals.set(key, (totals.get(key) ?? 0) + inv.total);
      grandTotal += inv.total;
    }
    if (grandTotal === 0) return [];
    return [...totals.entries()]
      .map(([name, total]) => ({ name, total, pct: Math.round((total / grandTotal) * 100) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [data]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Revenue by Department</CardTitle>
        <button
          onClick={() => toast.info("Detailed department reports aren't available yet.")}
          className="text-sm font-semibold text-primary hover:underline"
        >
          View Detailed Report
        </button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingScreen label="Loading revenue…" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : breakdown.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No billed revenue recorded yet.
          </p>
        ) : (
          <div className="space-y-4">
            {breakdown.map((b) => (
              <div key={b.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{b.name}</span>
                  <span className="text-muted-foreground">
                    {money(b.total)} ({b.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="pt-1 text-xs text-muted-foreground/70">
              Computed from current invoice records (excludes draft &amp; cancelled).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
