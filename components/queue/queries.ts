"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import { doctorsApi } from "@/lib/api/doctors";
import { queueApi } from "@/lib/api/queue";

export const queueKeys = {
  doctors: () => ["queue", "doctors"] as const,
  analytics: (date: string, doctorId?: number | string) =>
    ["queue", "analytics", date, doctorId ?? ""] as const,
  doctorQueue: (doctorId: number, date: string) =>
    ["queue", "doctor-queue", doctorId, date] as const,
};

export function useDoctors() {
  return useQuery({ queryKey: queueKeys.doctors(), queryFn: () => doctorsApi.list() });
}

export function useQueueAnalytics(date: string, doctorId?: number | string) {
  return useQuery({
    queryKey: queueKeys.analytics(date, doctorId),
    queryFn: () => queueApi.analytics({ date, doctor: doctorId }),
  });
}

/** Fetches each doctor's queue timeline for the day in parallel. There is no
 * bulk "all doctors' queues" endpoint on the backend, only the per-doctor
 * GET /api/doctors/{id}/queue/ — this is the existing-API-only way to build
 * a hospital-wide queue board. */
export function useDoctorQueues(doctorIds: number[], date: string) {
  return useQueries({
    queries: doctorIds.map((id) => ({
      queryKey: queueKeys.doctorQueue(id, date),
      queryFn: () => queueApi.doctorQueue(id, date),
    })),
  });
}

export function useStartConsultation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: number) => queueApi.startConsultation(appointmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["queue", "doctor-queue"] });
      qc.invalidateQueries({ queryKey: ["queue", "analytics"] });
    },
  });
}
