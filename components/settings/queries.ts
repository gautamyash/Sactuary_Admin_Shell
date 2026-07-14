"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  configurationValuesApi,
  hospitalProfileApi,
  type ConfigurationValue,
  type ConfigurationValueInput,
  type ConfigurationValueUpdateInput,
  type HospitalProfileInput,
} from "@/lib/api/hospitalConfig";

export const settingsKeys = {
  hospitalProfile: () => ["settings", "hospital-profile"] as const,
  configurationValues: () => ["settings", "configuration-values"] as const,
};

export function useHospitalProfile() {
  return useQuery({
    queryKey: settingsKeys.hospitalProfile(),
    queryFn: () => hospitalProfileApi.get(),
  });
}

/** Plain JSON update — General, Contact Information, and Localization all
 * use this; only Branding needs the logo-aware variant below. */
export function useUpdateHospitalProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: HospitalProfileInput) => hospitalProfileApi.update(input),
    onSuccess: (data) => {
      qc.setQueryData(settingsKeys.hospitalProfile(), data);
    },
  });
}

export function useUpdateHospitalProfileWithLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { input: HospitalProfileInput; file: File }) =>
      hospitalProfileApi.updateWithLogo(vars.input, vars.file),
    onSuccess: (data) => {
      qc.setQueryData(settingsKeys.hospitalProfile(), data);
    },
  });
}

export function useConfigurationValues() {
  return useQuery({
    queryKey: settingsKeys.configurationValues(),
    queryFn: () => configurationValuesApi.list(),
  });
}

export function useCreateConfigurationValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ConfigurationValueInput) => configurationValuesApi.create(input),
    onSuccess: (data) => {
      qc.setQueryData<ConfigurationValue[]>(settingsKeys.configurationValues(), (old) =>
        old ? [...old, data] : [data],
      );
    },
  });
}

export function useUpdateConfigurationValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { key: string; input: ConfigurationValueUpdateInput }) =>
      configurationValuesApi.update(vars.key, vars.input),
    onSuccess: (data) => {
      qc.setQueryData<ConfigurationValue[]>(settingsKeys.configurationValues(), (old) =>
        old ? old.map((c) => (c.key === data.key ? data : c)) : old,
      );
    },
  });
}
