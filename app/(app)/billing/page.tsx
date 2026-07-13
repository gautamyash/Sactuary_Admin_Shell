"use client";

import { useState } from "react";

import { BillingActions } from "@/components/billing/billing-actions";
import { BillingStats } from "@/components/billing/billing-stats";
import { InvoiceDetailDialog } from "@/components/billing/invoice-detail-dialog";
import { InvoicesCard } from "@/components/billing/invoices-card";
import { RemindersCard } from "@/components/billing/reminders-card";
import { RevenueByDepartmentCard } from "@/components/billing/revenue-by-department-card";
import { EMPTY_FILTERS, type AppliedFilters } from "@/components/billing/types";
import { ErrorState } from "@/components/common/error-state";
import { PermissionGate } from "@/components/common/permission-gate";
import { PageContainer } from "@/components/layout/page-container";
import type { AdminInvoice } from "@/lib/api/billing";

export default function BillingPage() {
  const [filters, setFilters] = useState<AppliedFilters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<AdminInvoice | null>(null);

  return (
    <PageContainer
      title="Billing & Invoices"
      description="Manage hospital revenue, patient billings, and insurance claims."
      actions={<BillingActions />}
    >
      <PermissionGate
        permission="billing.view"
        fallback={
          <ErrorState
            title="You don't have access"
            description="You need the billing.view permission to view billing."
          />
        }
      >
        <div className="space-y-6">
          <BillingStats />

          <InvoicesCard filters={filters} onFiltersChange={setFilters} onView={setSelected} />

          <div className="grid gap-6 lg:grid-cols-3">
            <RevenueByDepartmentCard className="lg:col-span-2" />
            <RemindersCard />
          </div>
        </div>

        <InvoiceDetailDialog
          invoice={selected}
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
        />
      </PermissionGate>
    </PageContainer>
  );
}
