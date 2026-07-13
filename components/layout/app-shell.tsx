"use client";

import { X } from "lucide-react";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

/**
 * Application chrome: persistent sidebar (desktop), a slide-over drawer variant
 * (mobile), the top header, and a scrollable responsive content region. Pages
 * render their own `PageContainer` inside `children`.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const mobileNavOpen = useUIStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          mobileNavOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileNavOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-foreground/40 transition-opacity",
            mobileNavOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileNavOpen(false)}
        />
        <div
          className={cn(
            "absolute left-0 top-0 h-full transition-transform",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="relative h-full">
            <Sidebar />
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
