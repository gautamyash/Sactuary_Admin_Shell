"use client";

import { useMemo } from "react";

import { useBillingAnalytics } from "@/components/billing/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card",
  net_banking: "Net Banking",
  insurance: "Insurance",
  wallet: "Wallet",
  cheque: "Cheque",
};

/**
 * Real payment-method revenue split from the billing analytics endpoint
 * (`payment_methods`). Not surfaced by any existing screen — Billing's own
 * RevenueAnalyticsCard only charts revenue-by-service — so this is new
 * rather than a duplicate, built in the same progress-bar-list style as
 * Dashboard's DepartmentTrendsCard / Billing's RevenueByDepartmentCard.
 */
export function PaymentMethodsCard() {
  const { data, isLoading, isError, error, refetch } = useBillingAnalytics();

  const rows = useMemo(() => {
    const methods = data?.paymentMethods ?? [];
    const total = methods.reduce((sum, m) => sum + m.total, 0);
    if (total === 0) return [];
    return [...methods]
      .sort((a, b) => b.total - a.total)
      .map((m) => ({
        name: METHOD_LABELS[m.method] ?? m.method,
        total: m.total,
        pct: Math.round((m.total / total) * 100),
      }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingScreen label="Loading payment methods…" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No successful payments recorded yet.
          </p>
        ) : (
          <div className="space-y-4">
            {rows.map((r) => (
              <div key={r.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{r.name}</span>
                  <span className="text-muted-foreground">
                    {money(r.total)} ({r.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
