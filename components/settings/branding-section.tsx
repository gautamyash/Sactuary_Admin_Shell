"use client";

import { ImageOff } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { FormField, inputClass } from "@/components/settings/form-field";
import {
  useHospitalProfile,
  useUpdateHospitalProfile,
  useUpdateHospitalProfileWithLogo,
} from "@/components/settings/queries";
import { SettingsSectionCard } from "@/components/settings/settings-section-card";
import { ApiError } from "@/lib/api/errors";

const colorInputClass = "h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-border bg-background p-1";

function isValidHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function BrandingSection() {
  const profile = useHospitalProfile();
  const update = useUpdateHospitalProfile();
  const updateWithLogo = useUpdateHospitalProfileWithLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [primaryColor, setPrimaryColor] = useState("#0061A4");
  const [secondaryColor, setSecondaryColor] = useState("#00497D");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saving = update.isPending || updateWithLogo.isPending;

  useEffect(() => {
    if (!profile.data) return;
    setPrimaryColor(profile.data.primaryColor);
    setSecondaryColor(profile.data.secondaryColor);
  }, [profile.data]);

  // Revoke the object URL used for a locally-selected file preview once it's
  // replaced or the component unmounts, so we don't leak blob URLs.
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  function onFileSelected(file: File | null) {
    setLogoFile(file);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidHexColor(primaryColor) || !isValidHexColor(secondaryColor)) {
      setError("Colors must be valid hex codes, e.g. #0061A4.");
      return;
    }
    try {
      if (logoFile) {
        await updateWithLogo.mutateAsync({
          input: { primaryColor, secondaryColor },
          file: logoFile,
        });
        onFileSelected(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        await update.mutateAsync({ primaryColor, secondaryColor });
      }
      toast.success("Branding saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save these changes.");
    }
  }

  const displayedLogo = logoPreview ?? profile.data?.logo ?? null;

  return (
    <SettingsSectionCard
      title="Branding"
      description="Logo and brand colors used across the admin panel and mobile app."
      isLoading={profile.isLoading}
      isError={profile.isError}
      error={profile.error}
      onRetry={() => profile.refetch()}
      onSubmit={submit}
      saving={saving}
    >
      <FormField label="Logo">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
            {displayedLogo ? (
              // eslint-disable-next-line @next/next/no-img-element -- external/media URL, not a static asset
              <img src={displayedLogo} alt="Hospital logo" className="size-full object-cover" />
            ) : (
              <ImageOff className="size-6 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
              className="text-sm text-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted"
            />
            <p className="text-xs text-muted-foreground">PNG, JPEG, WebP, or SVG.</p>
          </div>
        </div>
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Primary color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              className={colorInputClass}
              value={isValidHexColor(primaryColor) ? primaryColor : "#000000"}
              onChange={(e) => setPrimaryColor(e.target.value)}
            />
            <input
              className={inputClass}
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#0061A4"
            />
          </div>
        </FormField>
        <FormField label="Secondary color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              className={colorInputClass}
              value={isValidHexColor(secondaryColor) ? secondaryColor : "#000000"}
              onChange={(e) => setSecondaryColor(e.target.value)}
            />
            <input
              className={inputClass}
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              placeholder="#00497D"
            />
          </div>
        </FormField>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </SettingsSectionCard>
  );
}
