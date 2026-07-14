"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { label: "General", href: "/settings/general" },
  { label: "Branding", href: "/settings/branding" },
  { label: "Contact Information", href: "/settings/contact" },
  { label: "Localization", href: "/settings/localization" },
  { label: "Feature Configuration", href: "/settings/features" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Section switcher for Hospital Settings — mirrors components/access/access-tabs.tsx
 * exactly (same styling, same Link + usePathname pattern) so the two RBAC-style
 * multi-section admin modules stay visually and structurally consistent. */
export function SettingsTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-6 inline-flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1">
      {tabs.map((tab) => {
        const active = isActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
