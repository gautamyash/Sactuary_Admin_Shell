/**
 * UI/layout preference store.
 *
 * Persists chrome preferences (sidebar collapsed state, mobile drawer open)
 * across reloads. Sidebar collapse is remembered in localStorage; the mobile
 * drawer is ephemeral and reset on load.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
    }),
    {
      name: "sh.ui",
      // Only persist the durable preference, not the ephemeral drawer state.
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
