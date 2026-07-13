"use client";

import { Bell, HelpCircle, Menu, Search } from "lucide-react";

import { useUIStore } from "@/stores/ui-store";

/**
 * Top header: mobile nav toggle, global search field, and utility actions.
 * Search and notifications are presentational in the foundation phase; feature
 * phases wire them to real data.
 */
export function Header() {
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open navigation"
        className="rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative hidden max-w-xl flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search patients, doctors, records…"
          className="h-10 w-full rounded-full border border-border bg-muted/40 pl-10 pr-4 text-sm outline-none transition-colors focus:border-ring focus:bg-background"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          aria-label="Help"
          className="rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <HelpCircle className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  );
}
