import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";

/**
 * Factory for the shared QueryClient. A factory (rather than a module-level
 * singleton) avoids leaking cache between requests during SSR and between
 * users in the same process.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Never retry auth/permission failures; retry transient errors twice.
          if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}
