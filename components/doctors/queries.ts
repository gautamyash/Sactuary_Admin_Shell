"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  doctorLeavesApi,
  type DoctorLeaveInput,
} from "@/lib/api/doctor-leaves";
import {
  doctorSchedulesApi,
  type DoctorScheduleInput,
} from "@/lib/api/doctor-schedules";
import { doctorsApi, type DoctorInput, type DoctorListParams } from "@/lib/api/doctors";
import { specialtiesApi } from "@/lib/api/specialties";

export const doctorsKeys = {
  list: (p: DoctorListParams) => ["doctors", "list", p] as const,
  specialties: () => ["doctors", "specialties"] as const,
  schedules: (doctorId: number) => ["doctors", "schedules", doctorId] as const,
  leaves: (doctorId: number) => ["doctors", "leaves", doctorId] as const,
};

export function useDoctors(params: DoctorListParams = {}) {
  return useQuery({
    queryKey: doctorsKeys.list(params),
    queryFn: () => doctorsApi.list(params),
  });
}

export function useSpecialtyOptions() {
  return useQuery({ queryKey: doctorsKeys.specialties(), queryFn: () => specialtiesApi.list() });
}

export function useCreateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DoctorInput) => doctorsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctors", "list"] }),
  });
}

export function useUpdateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; input: Partial<DoctorInput> }) =>
      doctorsApi.update(vars.id, vars.input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctors", "list"] }),
  });
}

export function useDeleteDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => doctorsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctors", "list"] }),
  });
}

// -- Schedules -------------------------------------------------------------

export function useDoctorSchedules(doctorId: number, enabled = true) {
  return useQuery({
    queryKey: doctorsKeys.schedules(doctorId),
    queryFn: () => doctorSchedulesApi.list(doctorId),
    enabled: enabled && Number.isFinite(doctorId),
  });
}

/** Fetches each doctor's schedule in parallel — there's no bulk endpoint,
 * only the per-doctor GET .../schedules/, so this is the existing-API-only
 * way to show "today's schedule" across the whole directory grid. */
export function useDoctorSchedulesBatch(doctorIds: number[]) {
  return useQueries({
    queries: doctorIds.map((id) => ({
      queryKey: doctorsKeys.schedules(id),
      queryFn: () => doctorSchedulesApi.list(id),
    })),
  });
}

export function useCreateSchedule(doctorId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DoctorScheduleInput) => doctorSchedulesApi.create(doctorId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: doctorsKeys.schedules(doctorId) }),
  });
}

export function useUpdateSchedule(doctorId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { scheduleId: number; input: Partial<DoctorScheduleInput> }) =>
      doctorSchedulesApi.update(doctorId, vars.scheduleId, vars.input),
    onSuccess: () => qc.invalidateQueries({ queryKey: doctorsKeys.schedules(doctorId) }),
  });
}

export function useDeleteSchedule(doctorId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: number) => doctorSchedulesApi.remove(doctorId, scheduleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: doctorsKeys.schedules(doctorId) }),
  });
}

// -- Leaves ------------------------------------------------------------

export function useDoctorLeaves(doctorId: number, enabled = true) {
  return useQuery({
    queryKey: doctorsKeys.leaves(doctorId),
    queryFn: () => doctorLeavesApi.list(doctorId),
    enabled: enabled && Number.isFinite(doctorId),
  });
}

/** Same rationale as useDoctorSchedulesBatch — only a per-doctor endpoint exists. */
export function useDoctorLeavesBatch(doctorIds: number[]) {
  return useQueries({
    queries: doctorIds.map((id) => ({
      queryKey: doctorsKeys.leaves(id),
      queryFn: () => doctorLeavesApi.list(id),
    })),
  });
}

export function useCreateLeave(doctorId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DoctorLeaveInput) => doctorLeavesApi.create(doctorId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: doctorsKeys.leaves(doctorId) }),
  });
}

export function useUpdateLeave(doctorId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { leaveId: number; input: Partial<DoctorLeaveInput> }) =>
      doctorLeavesApi.update(doctorId, vars.leaveId, vars.input),
    onSuccess: () => qc.invalidateQueries({ queryKey: doctorsKeys.leaves(doctorId) }),
  });
}

export function useDeleteLeave(doctorId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (leaveId: number) => doctorLeavesApi.remove(doctorId, leaveId),
    onSuccess: () => qc.invalidateQueries({ queryKey: doctorsKeys.leaves(doctorId) }),
  });
}
