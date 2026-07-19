"use client";

import { X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { FormField, inputClass, labelClass, textareaClass } from "@/components/settings/form-field";
import { useCreateConfigurationValue } from "@/components/settings/queries";
import { Spinner } from "@/components/common/spinner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api/errors";
import type { ConfigurationValueData, ConfigurationValueType } from "@/lib/api/hospitalConfig";

const VALUE_TYPES: { value: ConfigurationValueType; label: string }[] = [
  { value: "boolean", label: "Boolean (switch)" },
  { value: "string", label: "String (text)" },
  { value: "integer", label: "Integer (number)" },
  { value: "json", label: "JSON" },
];

function emptyState() {
  return {
    key: "",
    label: "",
    category: "",
    description: "",
    valueType: "boolean" as ConfigurationValueType,
    boolValue: false,
    textValue: "",
    jsonValue: "{}",
  };
}

/**
 * Onboard-a-new-configuration-value dialog. Hand-rolled fixed-overlay
 * markup, matching components/doctors/doctor-form-dialog.tsx exactly (no
 * shadcn Dialog primitive exists in components/ui yet, so this reuses that
 * established pattern rather than introducing a second one).
 */
export function CreateConfigurationValueDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const create = useCreateConfigurationValue();
  const [form, setForm] = useState(emptyState());
  const [error, setError] = useState<string | null>(null);

  const resetDeps = [open];
  const [prevResetDeps, setPrevResetDeps] = useState(resetDeps);
  if (resetDeps[0] && resetDeps.some((v, i) => !Object.is(v, prevResetDeps[i]))) {
    setPrevResetDeps(resetDeps);
    setForm(emptyState());
    setError(null);
  }

  if (!open) return null;

  function set<K extends keyof ReturnType<typeof emptyState>>(
    key: K,
    value: ReturnType<typeof emptyState>[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const key = form.key.trim();
    if (!/^[a-zA-Z0-9_]+$/.test(key)) {
      setError("Key must contain only letters, numbers, and underscores.");
      return;
    }

    let value: ConfigurationValueData;
    if (form.valueType === "boolean") {
      value = form.boolValue;
    } else if (form.valueType === "integer") {
      const parsed = Number(form.textValue);
      if (!Number.isFinite(parsed)) {
        setError("Enter a valid whole number for the initial value.");
        return;
      }
      value = Math.trunc(parsed);
    } else if (form.valueType === "json") {
      try {
        value = form.jsonValue.trim() === "" ? null : JSON.parse(form.jsonValue);
      } catch {
        setError("Initial value is not valid JSON.");
        return;
      }
    } else {
      value = form.textValue;
    }

    try {
      await create.mutateAsync({
        key,
        value,
        valueType: form.valueType,
        label: form.label.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
      });
      toast.success(`${form.label.trim() || key} created.`);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create this configuration value.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-foreground/40" onClick={() => onOpenChange(false)} />
      <div className="relative flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-5 overflow-y-auto p-6 pr-8">
            <div>
              <h2 className="text-lg font-semibold text-foreground">New configuration value</h2>
              <p className="text-sm text-muted-foreground">
                Add a new toggle or setting — it becomes editable and available on the mobile
                bootstrap endpoint immediately, no deploy required.
              </p>
            </div>

            <FormField label="Key" hint="Letters, numbers, and underscores only, e.g. new_feature_enabled.">
              <input
                className={inputClass}
                value={form.key}
                onChange={(e) => set("key", e.target.value)}
                required
                placeholder="new_feature_enabled"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Label">
                <input
                  className={inputClass}
                  value={form.label}
                  onChange={(e) => set("label", e.target.value)}
                  placeholder="New Feature"
                />
              </FormField>
              <FormField label="Category">
                <input
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  placeholder="Patient"
                />
              </FormField>
            </div>

            <FormField label="Description">
              <textarea
                className={textareaClass}
                rows={2}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </FormField>

            <FormField label="Value type">
              <select
                className={inputClass}
                value={form.valueType}
                onChange={(e) => set("valueType", e.target.value as ConfigurationValueType)}
              >
                {VALUE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="space-y-1.5">
              <label className={labelClass}>Initial value</label>
              {form.valueType === "boolean" ? (
                <Switch checked={form.boolValue} onCheckedChange={(v) => set("boolValue", v)} />
              ) : form.valueType === "json" ? (
                <textarea
                  className={textareaClass + " font-mono text-xs"}
                  rows={4}
                  value={form.jsonValue}
                  onChange={(e) => set("jsonValue", e.target.value)}
                />
              ) : (
                <input
                  type={form.valueType === "integer" ? "number" : "text"}
                  className={inputClass}
                  value={form.textValue}
                  onChange={(e) => set("textValue", e.target.value)}
                />
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 border-t border-border p-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Spinner className="text-primary-foreground" />}
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
