"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/common/error-state";

/**
 * Route error boundary for the protected app group. Catches render/data errors
 * in any business screen and offers a recovery action.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for observability; wire to a logger in a later phase.
    console.error(error);
  }, [error]);

  return <ErrorState error={error} onRetry={reset} />;
}
