"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";

interface ErrorStateProps {
  error?: unknown;
  title?: string;
  description?: string;
  onRetry?: () => void;
}

/**
 * Reusable error panel. Understands `ApiError` (surfaces status + message) and
 * falls back gracefully for unknown errors. Used by route error boundaries and
 * inline data-fetch failures.
 */
export function ErrorState({ error, title, description, onRetry }: ErrorStateProps) {
  const apiError = error instanceof ApiError ? error : null;
  const resolvedTitle =
    title ?? (apiError?.status === 403 ? "You don't have access" : "Something went wrong");
  const resolvedDescription =
    description ??
    (error instanceof Error ? error.message : "An unexpected error occurred. Please try again.");

  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{resolvedTitle}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{resolvedDescription}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
