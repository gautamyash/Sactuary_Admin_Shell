"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { FormField, inputClass } from "@/components/settings/form-field";
import { useHospitalProfile, useUpdateHospitalProfile } from "@/components/settings/queries";
import { SettingsSectionCard } from "@/components/settings/settings-section-card";
import { ApiError } from "@/lib/api/errors";

export function LocalizationSection() {
  const profile = useHospitalProfile();
  const update = useUpdateHospitalProfile();

  const [timezone, setTimezone] = useState("");
  const [currency, setCurrency] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [prevProfileData, setPrevProfileData] = useState(profile.data);
  if (!Object.is(profile.data, prevProfileData)) {
    setPrevProfileData(profile.data);
    if (profile.data) {
      setTimezone(profile.data.timezone);
      setCurrency(profile.data.currency);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!timezone.trim() || !currency.trim()) {
      setError("Timezone and currency are required.");
      return;
    }
    try {
      await update.mutateAsync({
        timezone: timezone.trim(),
        currency: currency.trim().toUpperCase(),
      });
      toast.success("Localization settings saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save these changes.");
    }
  }

  return (
    <SettingsSectionCard
      title="Localization"
      description="Timezone and currency used for scheduling, invoicing, and reporting."
      isLoading={profile.isLoading}
      isError={profile.isError}
      error={profile.error}
      onRetry={() => profile.refetch()}
      onSubmit={submit}
      saving={update.isPending}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Timezone" hint="IANA timezone name, e.g. America/New_York or UTC.">
          <input
            className={inputClass}
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            required
            placeholder="UTC"
          />
        </FormField>
        <FormField label="Currency" hint="ISO 4217 code, e.g. USD, INR, EUR.">
          <input
            className={inputClass}
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            required
            maxLength={8}
            placeholder="USD"
          />
        </FormField>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </SettingsSectionCard>
  );
}
