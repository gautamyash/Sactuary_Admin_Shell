"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { inputClass, textareaClass } from "@/components/settings/form-field";
import { useUpdateConfigurationValue } from "@/components/settings/queries";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/common/spinner";
import { Switch } from "@/components/ui/switch";
import { usePermissions } from "@/hooks/use-permissions";
import { ApiError } from "@/lib/api/errors";
import type { ConfigurationValue, ConfigurationValueData } from "@/lib/api/hospitalConfig";

function stringifyForEditing(value: ConfigurationValueData): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

export function ConfigurationValueRow({ item }: { item: ConfigurationValue }) {
  const update = useUpdateConfigurationValue();
  const { has } = usePermissions();
  const canEdit = has("settings.edit");

  // Boolean: optimistic, immediate save on toggle.
  const [boolValue, setBoolValue] = useState(Boolean(item.value));
  // String / integer: plain text, explicit save when dirty.
  const [textValue, setTextValue] = useState(() => stringifyForEditing(item.value));
  // JSON: textarea holding the raw editable text, parsed on save.
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    setBoolValue(Boolean(item.value));
    setTextValue(stringifyForEditing(item.value));
    setJsonError(null);
  }, [item.value]);

  const dirty =
    item.valueType === "json"
      ? textValue !== stringifyForEditing(item.value)
      : item.valueType !== "boolean" && textValue !== stringifyForEditing(item.value);

  async function toggleBoolean(next: boolean) {
    const previous = boolValue;
    setBoolValue(next);
    try {
      await update.mutateAsync({ key: item.key, input: { value: next } });
      toast.success(`${item.label || item.key} ${next ? "enabled" : "disabled"}.`);
    } catch (err) {
      setBoolValue(previous);
      toast.error(err instanceof ApiError ? err.message : "Could not update this setting.");
    }
  }

  async function saveText() {
    let nextValue: ConfigurationValueData = textValue;
    if (item.valueType === "integer") {
      const parsed = Number(textValue);
      if (!Number.isFinite(parsed)) {
        toast.error("Enter a valid whole number.");
        return;
      }
      nextValue = Math.trunc(parsed);
    } else if (item.valueType === "json") {
      try {
        nextValue = textValue.trim() === "" ? null : JSON.parse(textValue);
        setJsonError(null);
      } catch {
        setJsonError("Invalid JSON.");
        return;
      }
    }
    try {
      await update.mutateAsync({ key: item.key, input: { value: nextValue } });
      toast.success(`${item.label || item.key} updated.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update this setting.");
    }
  }

  function cancelEdit() {
    setTextValue(stringifyForEditing(item.value));
    setJsonError(null);
  }

  return (
    <tr>
      <td className="px-5 py-3 align-top">
        <p className="font-medium text-foreground">{item.label || item.key}</p>
        <code className="mt-0.5 inline-block rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {item.key}
        </code>
        {item.description && (
          <p className="mt-1 max-w-md text-xs text-muted-foreground">{item.description}</p>
        )}
      </td>
      <td className="px-5 py-3 align-top text-right">
        {item.valueType === "boolean" ? (
          <Switch
            checked={boolValue}
            disabled={!canEdit || update.isPending}
            onCheckedChange={toggleBoolean}
          />
        ) : item.valueType === "json" ? (
          <div className="ml-auto flex w-full max-w-sm flex-col items-end gap-2">
            <textarea
              className={textareaClass + " font-mono text-xs"}
              rows={4}
              value={textValue}
              disabled={!canEdit}
              onChange={(e) => setTextValue(e.target.value)}
            />
            {jsonError && <p className="text-xs text-destructive">{jsonError}</p>}
            {dirty && canEdit && (
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={saveText} disabled={update.isPending}>
                  {update.isPending && <Spinner className="text-primary-foreground" />}
                  Save
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="ml-auto flex w-full max-w-xs items-center justify-end gap-2">
            <input
              type={item.valueType === "integer" ? "number" : "text"}
              step={item.valueType === "integer" ? 1 : undefined}
              className={inputClass}
              value={textValue}
              disabled={!canEdit}
              onChange={(e) => setTextValue(e.target.value)}
            />
            {dirty && canEdit && (
              <div className="flex shrink-0 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={saveText} disabled={update.isPending}>
                  {update.isPending && <Spinner className="text-primary-foreground" />}
                  Save
                </Button>
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
