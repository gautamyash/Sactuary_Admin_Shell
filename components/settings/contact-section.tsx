"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { FormField, inputClass, textareaClass } from "@/components/settings/form-field";
import { useHospitalProfile, useUpdateHospitalProfile } from "@/components/settings/queries";
import { SettingsSectionCard } from "@/components/settings/settings-section-card";
import { ApiError } from "@/lib/api/errors";

export function ContactSection() {
  const profile = useHospitalProfile();
  const update = useUpdateHospitalProfile();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [prevProfileData, setPrevProfileData] = useState(profile.data);
  if (!Object.is(profile.data, prevProfileData)) {
    setPrevProfileData(profile.data);
    if (profile.data) {
      setEmail(profile.data.email);
      setPhone(profile.data.phone);
      setAddress(profile.data.address);
      setWebsite(profile.data.website);
      setGstNumber(profile.data.gstNumber);
      setRegistrationNumber(profile.data.registrationNumber);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await update.mutateAsync({
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        website: website.trim(),
        gstNumber: gstNumber.trim(),
        registrationNumber: registrationNumber.trim(),
      });
      toast.success("Contact information saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save these changes.");
    }
  }

  return (
    <SettingsSectionCard
      title="Contact Information"
      description="How patients and the mobile app reach the hospital, plus optional registration details."
      isLoading={profile.isLoading}
      isError={profile.isError}
      error={profile.error}
      onRetry={() => profile.refetch()}
      onSubmit={submit}
      saving={update.isPending}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Email">
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@hospital.example"
          />
        </FormField>
        <FormField label="Phone">
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 010 0100"
          />
        </FormField>
        <FormField label="Website">
          <input
            type="url"
            className={inputClass}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://hospital.example"
          />
        </FormField>
        <FormField label="GST number" hint="Optional.">
          <input
            className={inputClass}
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
          />
        </FormField>
        <FormField label="Registration / License number" hint="Optional." className="space-y-1.5 sm:col-span-2">
          <input
            className={inputClass}
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Address">
        <textarea
          className={textareaClass}
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </FormField>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </SettingsSectionCard>
  );
}
