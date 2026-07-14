"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { FormField, inputClass } from "@/components/settings/form-field";
import { useHospitalProfile, useUpdateHospitalProfile } from "@/components/settings/queries";
import { SettingsSectionCard } from "@/components/settings/settings-section-card";
import { ApiError } from "@/lib/api/errors";

export function GeneralSection() {
  const profile = useHospitalProfile();
  const update = useUpdateHospitalProfile();

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile.data) return;
    setName(profile.data.name);
    setShortName(profile.data.shortName);
  }, [profile.data]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Hospital name is required.");
      return;
    }
    try {
      await update.mutateAsync({ name: name.trim(), shortName: shortName.trim() });
      toast.success("General settings saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save these changes.");
    }
  }

  return (
    <SettingsSectionCard
      title="General"
      description="The hospital's identity as it appears across the admin panel and mobile app."
      isLoading={profile.isLoading}
      isError={profile.isError}
      error={profile.error}
      onRetry={() => profile.refetch()}
      onSubmit={submit}
      saving={update.isPending}
    >
      <FormField label="Hospital name">
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Sanctuary Health"
        />
      </FormField>
      <FormField
        label="Short name"
        hint="A shorter label used in tight spaces, e.g. the mobile app header."
      >
        <input
          className={inputClass}
          value={shortName}
          onChange={(e) => setShortName(e.target.value)}
          placeholder="Sanctuary"
        />
      </FormField>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </SettingsSectionCard>
  );
}
