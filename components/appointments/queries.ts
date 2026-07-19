"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  appointmentsApi,
  type AdminAppointmentParams,
  type CreateAppointmentInput,
} from "@/lib/api/appointments";
import { doctorsApi } from "@/lib/api/doctors";
import { specialtiesApi } from "@/lib/api/specialties";

export function todayISO(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export const apptKeys = {
  list: (p: AdminAppointmentParams) => ["appointments", "list", p] as const,
  today: (date: string) => ["appointments", "today", date] as const,
  doctors: () => ["appointments", "doctors"] as const,
  specialties: () => ["appointments", "specialties"] as const,
};

export function useAppointments(params: AdminAppointmentParams) {
  return useQuery({
    queryKey: apptKeys.list(params),
    queryFn: () => appointmentsApi.adminList(params),
  });
}

export function useTodayAppointments() {
  const date = todayISO();
  return useQuery({
    queryKey: apptKeys.today(date),
    queryFn: () => appointmentsApi.adminList({ date }),
  });
}

export function useDoctorOptions() {
  return useQuery({ queryKey: apptKeys.doctors(), queryFn: () => doctorsApi.list() });
}

export function useSpecialtyOptions() {
  return useQuery({ queryKey: apptKeys.specialties(), queryFn: () => specialtiesApi.list() });
}

/** POST /api/admin/appointments/ for an arbitrary patient (Phase: Export
 * Report & New Appointment actions) — the same admin booking endpoint
 * (appointmentsApi.create) FollowUpCarePlanDialog's useCreateFollowUpAppointment
 * already calls, just not pinned to one patient ahead of time. Used by the
 * general-purpose "New Appointment" action (Dashboard, and reusable anywhere
 * else that placeholder appears) rather than a parallel booking call.
 * Invalidates the same "appointments" prefix useCreateFollowUpAppointment
 * does, plus "dashboard" since the Dashboard's own today's-appointments query
 * lives under a separate key prefix. */
export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => appointmentsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
