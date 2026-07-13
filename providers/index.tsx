"use client";

import { Toaster } from "sonner";

import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

/**
 * Single composition point for all client-side providers, mounted once in the
 * root layout. Order: theme (outermost, controls the `.dark` class) → data
 * (React Query) → toasts.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </QueryProvider>
    </ThemeProvider>
  );
}
