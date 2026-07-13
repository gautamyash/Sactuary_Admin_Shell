"use client";

import { useQuery } from "@tanstack/react-query";

import { analyticsApi } from "@/lib/api/analytics";
import { billingApi, type AdminInvoiceParams } from "@/lib/api/billing";
import { specialtiesApi } from "@/lib/api/specialties";

export const billingKeys = {
  list: (p: AdminInvoiceParams) => ["billing", "invoices", p] as const,
  analytics: () => ["billing", "analytics"] as const,
  specialties: () => ["billing", "specialties"] as const,
};

export function useInvoices(params: AdminInvoiceParams) {
  return useQuery({
    queryKey: billingKeys.list(params),
    queryFn: () => billingApi.adminList(params),
  });
}

export function useBillingAnalytics() {
  return useQuery({ queryKey: billingKeys.analytics(), queryFn: () => analyticsApi.billing() });
}

export function useDepartmentOptions() {
  return useQuery({ queryKey: billingKeys.specialties(), queryFn: () => specialtiesApi.list() });
}
