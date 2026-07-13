"use client";

import { Check } from "lucide-react";
import { useMemo } from "react";

import { usePermissionCatalog } from "@/components/access/queries";
import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen } from "@/components/common/spinner";
import { Badge } from "@/components/ui/badge";
import type { Permission } from "@/types";

function groupByCategory(permissions: Permission[]) {
  const groups: Record<string, Permission[]> = {};
  for (const p of permissions) {
    (groups[p.category] ??= []).push(p);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export function PermissionsList() {
  const { data, isLoading, isError, error, refetch } = usePermissionCatalog();
  const grouped = useMemo(() => groupByCategory(data ?? []), [data]);

  if (isLoading) return <LoadingScreen label="Loading permissions…" />;
  if (isError || !data) return <ErrorState error={error} onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Permission catalog
        </h2>
        <Badge variant="secondary">{data.length} total</Badge>
      </div>

      <div className="space-y-5">
        {grouped.map(([category, perms]) => (
          <div key={category} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3">
              <p className="text-sm font-semibold text-foreground">{category}</p>
              <span className="text-xs text-muted-foreground">{perms.length} permissions</span>
            </div>
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-border">
                {perms.map((perm) => (
                  <tr key={perm.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{perm.name}</p>
                      {perm.description && (
                        <p className="text-xs text-muted-foreground">{perm.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                        {perm.code}
                      </code>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Check className="size-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
