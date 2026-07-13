"use client";

import { Download, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { InvoiceStatusBadge } from "@/components/billing/status-badge";
import { Spinner } from "@/components/common/spinner";
import { Button } from "@/components/ui/button";
import { billingApi, type AdminInvoice } from "@/lib/api/billing";
import { ApiError } from "@/lib/api/errors";

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Invoice detail modal. Reuses the invoice object already returned by the
 * admin list endpoint (which nests items/payments/refunds) — no extra
 * request needed to open it, only the PDF download hits the network.
 */
export function InvoiceDetailDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: AdminInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [downloading, setDownloading] = useState(false);

  if (!open || !invoice) return null;

  async function handleDownload() {
    if (!invoice) return;
    setDownloading(true);
    try {
      await billingApi.downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not download the invoice PDF.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-foreground/40" onClick={() => onOpenChange(false)} />
      <div className="relative flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        <div className="overflow-y-auto p-6">
          <div className="mb-5 flex items-start justify-between gap-4 pr-8">
            <div>
              <p className="font-mono text-sm font-semibold text-primary">
                #{invoice.invoiceNumber}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                {invoice.patientName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {invoice.doctorName ?? "No doctor assigned"}
                {invoice.specialty ? ` · ${invoice.specialty}` : ""}
              </p>
            </div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Issued</p>
              <p className="font-medium text-foreground">{formatDateTime(invoice.issuedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="font-medium text-foreground">{formatDateTime(invoice.paidAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payment status</p>
              <p className="font-medium capitalize text-foreground">{invoice.paymentStatus}</p>
            </div>
          </div>

          <div className="mb-5">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Line items</h3>
            {invoice.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No line items recorded.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Description</th>
                      <th className="px-3 py-2 text-right font-medium">Qty</th>
                      <th className="px-3 py-2 text-right font-medium">Unit</th>
                      <th className="px-3 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.items.map((it) => (
                      <tr key={it.id}>
                        <td className="px-3 py-2 text-foreground">{it.description}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">
                          {it.quantity}
                        </td>
                        <td className="px-3 py-2 text-right text-muted-foreground">
                          {money(it.unitPrice)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-foreground">
                          {money(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mb-5 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{money(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-foreground">-{money(invoice.discount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-foreground">{money(invoice.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{money(invoice.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span className="text-foreground">{money(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">Balance</span>
              <span className="text-foreground">{money(invoice.balance)}</span>
            </div>
          </div>

          {invoice.payments.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Payments</h3>
              <ul className="space-y-1.5 text-sm">
                {invoice.payments.map((p) => (
                  <li key={p.id} className="flex justify-between text-muted-foreground">
                    <span className="capitalize">
                      {p.method.replace("_", " ")} · {formatDateTime(p.paidAt)}
                    </span>
                    <span className="font-medium text-foreground">{money(p.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {invoice.refunds.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Refunds</h3>
              <ul className="space-y-1.5 text-sm">
                {invoice.refunds.map((r) => (
                  <li key={r.id} className="flex justify-between text-muted-foreground">
                    <span>{r.reason || "Refund"} · {formatDateTime(r.processedAt)}</span>
                    <span className="font-medium text-foreground">{money(r.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleDownload} disabled={downloading}>
            {downloading ? <Spinner className="text-primary-foreground" /> : <Download className="size-4" />}
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
