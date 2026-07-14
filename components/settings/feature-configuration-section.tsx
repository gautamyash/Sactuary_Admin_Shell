"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { CreateConfigurationValueDialog } from "@/components/settings/create-configuration-value-dialog";
import { ConfigurationValueRow } from "@/components/settings/configuration-value-row";
import { useConfigurationValues } from "@/components/settings/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";
import type { ConfigurationValue } from "@/lib/api/hospitalConfig";

function groupByCategory(items: ConfigurationValue[]) {
  const groups: Record<string, ConfigurationValue[]> = {};
  for (const item of items) {
    const category = item.category || "General";
    (groups[category] ??= []).push(item);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export function FeatureConfigurationSection() {
  const { data, isLoading, isError, error, refetch } = useConfigurationValues();
  const { has } = usePermissions();
  const canEdit = has("settings.edit");
  const [dialogOpen, setDialogOpen] = useState(false);

  const grouped = useMemo(() => groupByCategory(data ?? []), [data]);

  if (isLoading) return <LoadingScreen label="Loading feature configuration…" />;
  if (isError || !data) return <ErrorState error={error} onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Feature configuration
          </h2>
          <Badge variant="secondary">{data.length} total</Badge>
        </div>
        {canEdit && (
          <Button type="button" size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Add configuration value
          </Button>
        )}
      </div>

      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No configuration values yet.{" "}
          {canEdit ? "Add one to get started." : "Check back once an administrator adds one."}
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([category, items]) => (
            <div key={category} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3">
                <p className="text-sm font-semibold text-foreground">{category}</p>
                <span className="text-xs text-muted-foreground">{items.length} settings</span>
              </div>
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <ConfigurationValueRow key={item.key} item={item} />
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <CreateConfigurationValueDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
