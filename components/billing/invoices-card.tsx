"use client";

import { ChevronLeft, ChevronRight, Download, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useDepartmentOptions, useInvoices } from "@/components/billing/queries";
import { InvoiceStatusBadge } from "@/components/billing/status-badge";
import { STATUS_OPTIONS, type AppliedFilters } from "@/components/billing/types";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { AdminInvoice } from "@/lib/api/billing";
import { billingApi } from "@/lib/api/billing";
import { ApiError } from "@/lib/api/errors";
import { patientReference } from "@/components/patients/patients-table";

const PAGE_SIZE = 12;

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/** First line item description stands in for "service type" — the closest
 * real field the backend exposes (invoices have no dedicated service-type
 * column of their own). */
function serviceType(invoice: AdminInvoice): string {
  if (invoice.items.length === 0) return "—";
  if (invoice.items.length === 1) return invoice.items[0].description;
  return `${invoice.items[0].description} +${invoice.items.length - 1} more`;
}

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export function InvoicesCard({
  filters,
  onFiltersChange,
  onView,
}: {
  filters: AppliedFilters;
  onFiltersChange: (f: AppliedFilters) => void;
  onView: (invoice: AdminInvoice) => void;
}) {
  const departments = useDepartmentOptions();
  const { data, isLoading, isError, error, refetch } = useInvoices({
    status: filters.status || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  });
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const rows = useMemo(
    () => (data ?? []).filter((i) => !filters.department || i.specialty === filters.department),
    [data, filters.department],
  );

  const pageResetDeps = [filters, data];
  const [prevPageResetDeps, setPrevPageResetDeps] = useState(pageResetDeps);
  if (pageResetDeps.some((v, i) => !Object.is(v, prevPageResetDeps[i]))) {
    setPrevPageResetDeps(pageResetDeps);
    setPage(1);
  }

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);
  const showingFrom = total === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + PAGE_SIZE, total);

  async function handleDownload(invoice: AdminInvoice) {
    setDownloadingId(invoice.id);
    try {
      await billingApi.downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not download the invoice PDF.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Filters row */}
      <div className="flex flex-col gap-3 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.value ? opt.label : "Status: All Invoices"}
              </option>
            ))}
          </select>

          <select
            value={filters.department}
            onChange={(e) => onFiltersChange({ ...filters, department: e.target.value })}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring"
          >
            <option value="">Department: All</option>
            {departments.data?.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
              className="h-10 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus:border-ring"
              aria-label="From date"
            />
            <span className="text-sm text-muted-foreground">–</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
              className="h-10 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus:border-ring"
              aria-label="To date"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {showingFrom}-{showingTo} of {total} items
        </p>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-6">
          <LoadingScreen label="Loading invoices…" />
        </div>
      ) : isError ? (
        <div className="p-6">
          <ErrorState error={error} onRetry={() => refetch()} />
        </div>
      ) : total === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No invoices match these filters.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30">
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Invoice ID</th>
                  <th className="px-5 py-3 font-medium">Patient Name</th>
                  <th className="px-5 py-3 font-medium">Service Type</th>
                  <th className="px-5 py-3 font-medium">Date Issued</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageRows.map((inv) => (
                  <tr key={inv.id} className="group transition-colors hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono text-sm font-semibold text-primary">
                      #{inv.invoiceNumber}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={inv.patientName} className="size-8 text-xs" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {inv.patientName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {patientReference(inv.patientId)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded bg-muted px-2 py-1 text-xs text-foreground">
                        {serviceType(inv)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDate(inv.issuedAt)}</td>
                    <td className="px-5 py-3 font-semibold text-foreground">
                      {money(inv.total)}
                    </td>
                    <td className="px-5 py-3">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          title="View details"
                          onClick={() => onView(inv)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          type="button"
                          title="Download PDF"
                          disabled={downloadingId === inv.id}
                          onClick={() => handleDownload(inv)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary disabled:opacity-50"
                        >
                          <Download className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-muted/20 p-4 md:flex-row">
            <p className="text-xs text-muted-foreground">
              Viewing {pageRows.length} out of {total} total invoices
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-primary disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
                Previous
              </button>
              <div className="flex gap-1">
                {pageNumbers(page, totalPages).map((p, idx) =>
                  p === "…" ? (
                    <span key={`e${idx}`} className="px-1 text-sm text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={
                        p === page
                          ? "flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
                          : "flex size-8 items-center justify-center rounded-lg text-sm text-muted-foreground hover:bg-muted"
                      }
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-primary hover:underline disabled:pointer-events-none disabled:text-muted-foreground disabled:opacity-40"
              >
                Next
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
