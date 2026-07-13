"use client";

import { useQuery } from "@tanstack/react-query";

import { appointmentsApi, type AdminAppointmentParams } from "@/lib/api/appointments";
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
