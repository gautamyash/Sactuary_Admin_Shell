"use client";

import { Banknote, Clock, RotateCcw, TrendingUp } from "lucide-react";

import { useBillingAnalytics } from "@/components/billing/queries";
import { StatCard } from "@/components/dashboard/stat-card";

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const monthLabel = () =>
  new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

/**
 * KPI row from the Stitch design. The design shows period-over-period deltas
 * (+8.4%, -2.1%, "Monthly Growth 24.5%") that have no backing endpoint — the
 * billing analytics API returns point-in-time totals only, not trends. Rather
 * than fabricate percentages, each card shows a real supporting figure
 * instead (mirrors the Dashboard KPI convention).
 */
export function BillingStats() {
  const { data, isLoading, isError, error, refetch } = useBillingAnalytics();
  void error;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Revenue"
        icon={Banknote}
        loading={isLoading}
        error={isError}
        value={data ? money(data.monthlyRevenue) : undefined}
        hint={`Collected in ${monthLabel()}`}
        hintTone="up"
      />
      <StatCard
        label="Outstanding Dues"
        icon={Clock}
        loading={isLoading}
        error={isError}
        value={data ? money(data.pendingPayments) : undefined}
        accent={!!data && data.pendingPayments > 0}
        hint="Unpaid + partially paid invoices"
        hintTone="muted"
      />
      <StatCard
        label="Refunds Processed"
        icon={RotateCcw}
        loading={isLoading}
        error={isError}
        value={data ? money(data.refunds) : undefined}
        hint="All-time total"
        hintTone="muted"
      />
      <StatCard
        label="Collection Rate"
        icon={TrendingUp}
        loading={isLoading}
        error={isError}
        value={data ? `${data.collectionRate}%` : undefined}
        hint={data ? `Avg invoice ${money(data.averageInvoice)}` : undefined}
        hintTone="up"
      />
      {isError && (
        <button
          onClick={() => refetch()}
          className="col-span-full text-left text-xs text-muted-foreground hover:text-primary"
        >
          Retry loading billing analytics
        </button>
      )}
    </div>
  );
}
