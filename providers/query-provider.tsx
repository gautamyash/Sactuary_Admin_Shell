"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { makeQueryClient } from "@/lib/query/query-client";

/**
 * Provides a stable per-mount QueryClient. `useState` ensures the client is
 * created once on the client and not recreated on re-render.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
