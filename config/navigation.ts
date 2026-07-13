/**
 * Sidebar navigation configuration.
 *
 * Each item optionally declares the RBAC `permission` code required to view it.
 * The sidebar filters items against the caller's effective permissions
 * (from `/api/auth/me/permissions/`), and route guards enforce the same codes
 * server-side. Business screens are NOT implemented in this phase — these
 * entries define the route/permission contract the feature phases will fill in.
 *
 * Permission codes correspond to the Django RBAC catalog. `Doctors` has no
 * dedicated backend code yet (a known gap documented in the roadmap) and is
 * therefore left ungated for now.
 */

import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  Receipt,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

import type { NavItem } from "@/types";

export const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard, permission: "analytics.view", section: "main" },
  { title: "Appointments", href: "/appointments", icon: CalendarDays, permission: "appointment.view", section: "main" },
  { title: "Queue", href: "/queue", icon: ListChecks, permission: "queue.view", section: "main" },
  { title: "Doctors", href: "/doctors", icon: Stethoscope, section: "main" },
  { title: "Patients", href: "/patients", icon: Users, permission: "emr.view", section: "main" },
  { title: "Billing", href: "/billing", icon: Receipt, permission: "billing.view", section: "main" },
  { title: "Analytics", href: "/analytics", icon: BarChart3, permission: "analytics.view", section: "main" },
  { title: "Access", href: "/access", icon: ShieldCheck, permission: "user.view", section: "main" },
  { title: "Settings", href: "/settings", icon: Settings, permission: "settings.view", section: "main" },
];

export const navConfig = { mainNav };
