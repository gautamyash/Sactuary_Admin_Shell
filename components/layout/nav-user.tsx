"use client";

import { LogOut } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

function initials(name?: string) {
  if (!name) return "SH";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * User identity chip with a logout action, shown in the sidebar footer.
 * Collapses to just the avatar when the sidebar is collapsed.
 */
export function NavUser({ collapsed = false }: { collapsed?: boolean }) {
  const { user, logout } = useAuth();

  return (
    <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {initials(user?.name)}
      </div>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">
            {user?.name ?? "Signed in"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</p>
        </div>
      )}
      {!collapsed && (
        <button
          type="button"
          onClick={logout}
          aria-label="Log out"
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-4" />
        </button>
      )}
    </div>
  );
}
