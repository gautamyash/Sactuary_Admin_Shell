"use client";

import { HeartPulse, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavUser } from "@/components/layout/nav-user";
import { mainNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { usePermissions } from "@/hooks/use-permissions";
import { useUIStore } from "@/stores/ui-store";
import type { NavItem } from "@/types";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.title : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className={cn("size-5 shrink-0", active ? "text-primary" : "text-current")} />
      {!collapsed && <span className="truncate">{item.title}</span>}
    </Link>
  );
}

/**
 * Persistent left sidebar: brand mark, permission-filtered navigation, a
 * collapse toggle, and the user footer. Navigation items whose `permission`
 * code the user lacks are hidden.
 */
export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);
  const { has } = usePermissions();

  const items = mainNav.filter((item) => has(item.permission));

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      {/* Brand */}
      <div className={cn("flex items-center gap-3 px-5 py-5", collapsed && "justify-center px-0")}>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <HeartPulse className="size-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-base font-bold leading-tight text-primary">
              {siteConfig.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">{siteConfig.hospital}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <NavUser collapsed={collapsed} />
      </div>
    </aside>
  );
}
