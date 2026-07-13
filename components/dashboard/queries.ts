"use client";

import { useQuery } from "@tanstack/react-query";

import { analyticsApi } from "@/lib/api/analytics";
import { appointmentsApi } from "@/lib/api/appointments";
import { doctorsApi } from "@/lib/api/doctors";

/** Local YYYY-MM-DD for "today", used for date-scoped queries. */
export function todayISO(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export const dashboardKeys = {
  billing: () => ["dashboard", "billing-analytics"] as const,
  attendance: () => ["dashboard", "attendance-analytics"] as const,
  queue: () => ["dashboard", "queue-analytics"] as const,
  doctors: () => ["dashboard", "doctors"] as const,
  appointmentsToday: (date: string) => ["dashboard", "appointments-today", date] as const,
};

export function useBillingAnalytics() {
  return useQuery({ queryKey: dashboardKeys.billing(), queryFn: () => analyticsApi.billing() });
}

export function useAttendanceAnalytics() {
  return useQuery({ queryKey: dashboardKeys.attendance(), queryFn: () => analyticsApi.attendance() });
}

export function useQueueAnalytics() {
  return useQuery({ queryKey: dashboardKeys.queue(), queryFn: () => analyticsApi.queue() });
}

export function useDoctors() {
  return useQuery({ queryKey: dashboardKeys.doctors(), queryFn: () => doctorsApi.list() });
}

export function useTodayAppointments() {
  const date = todayISO();
  return useQuery({
    queryKey: dashboardKeys.appointmentsToday(date),
    queryFn: () => appointmentsApi.adminList({ date }),
  });
}
