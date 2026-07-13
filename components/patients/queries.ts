"use client";

import { useQuery } from "@tanstack/react-query";

import { recordsApi } from "@/lib/api/records";
import { usersApi } from "@/lib/api/users";

export const patientKeys = {
  directory: (search?: string) => ["patients", "directory", search ?? ""] as const,
  profile: (id: number) => ["patients", "profile", id] as const,
  record: (id: number) => ["patients", "record", id] as const,
  visits: (id: number) => ["patients", "visits", id] as const,
  timeline: (id: number) => ["patients", "timeline", id] as const,
};

/** Patients directory: users are the only patient source; staff are filtered out. */
export function usePatients(search?: string) {
  return useQuery({
    queryKey: patientKeys.directory(search),
    queryFn: async () => {
      const users = await usersApi.list(search);
      return users.filter((u) => !u.isStaff);
    },
  });
}

export function usePatientProfile(id: number) {
  return useQuery({
    queryKey: patientKeys.profile(id),
    queryFn: () => usersApi.get(id),
    enabled: Number.isFinite(id),
  });
}

export function usePatientRecord(id: number) {
  return useQuery({
    queryKey: patientKeys.record(id),
    queryFn: () => recordsApi.patientRecord(id),
    enabled: Number.isFinite(id),
  });
}

export function usePatientVisits(id: number) {
  return useQuery({
    queryKey: patientKeys.visits(id),
    queryFn: () => recordsApi.patientVisits(id),
    enabled: Number.isFinite(id),
  });
}

export function usePatientTimeline(id: number) {
  return useQuery({
    queryKey: patientKeys.timeline(id),
    queryFn: () => recordsApi.patientTimeline(id),
    enabled: Number.isFinite(id),
  });
}
