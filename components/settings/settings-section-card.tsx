"use client";

import type { FormEvent, ReactNode } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingScreen, Spinner } from "@/components/common/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/use-permissions";

/**
 * Shared card + form shell for every Hospital Settings section (General,
 * Branding, Contact Information, Localization). Handles the loading /
 * error / saving states uniformly so each section only needs to describe
 * its own fields.
 *
 * The Save button is disabled (not hidden) for a viewer who only holds
 * "settings.view" — they can still see every field, matching how the
 * section itself is reachable under that same permission, but only
 * "settings.edit" can actually submit changes. Both codes already exist in
 * the backend RBAC catalog and are granted together to Owner/Admin.
 */
export function SettingsSectionCard({
  title,
  description,
  isLoading,
  isError,
  error,
  onRetry,
  onSubmit,
  saving,
  saveLabel = "Save changes",
  children,
}: {
  title: string;
  description?: string;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onSubmit: (e: FormEvent) => void;
  saving: boolean;
  saveLabel?: string;
  children: ReactNode;
}) {
  const { has } = usePermissions();
  const canEdit = has("settings.edit");

  if (isLoading) return <LoadingScreen label={`Loading ${title.toLowerCase()}…`} />;
  if (isError) return <ErrorState error={error} onRetry={onRetry} />;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {children}
          {!canEdit && (
            <p className="text-xs text-muted-foreground">
              You have view-only access to Hospital Settings. Contact an administrator for
              &quot;settings.edit&quot; to make changes.
            </p>
          )}
        </CardContent>
        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <Button type="submit" disabled={saving || !canEdit}>
            {saving && <Spinner className="text-primary-foreground" />}
            {saveLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
