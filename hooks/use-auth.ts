"use client";

import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

import { authApi } from "@/lib/api/auth";
import { setAuthFailureHandler } from "@/lib/api/client";
import { tokenStorage } from "@/lib/api/token-storage";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Session lifecycle hook.
 *
 * - `bootstrap()` hydrates the auth store from an existing cookie session
 *   (called by the protected layout guard on mount).
 * - `login` / `logout` mutate the session and local credentials.
 * - Registers a global handler so that a failed token refresh clears the store.
 */
export function useAuth() {
  const { user, status, setSession, setStatus, clear } = useAuthStore();

  // When the API client's refresh fails, drop session state.
  useEffect(() => {
    setAuthFailureHandler(() => clear());
    return () => setAuthFailureHandler(null);
  }, [clear]);

  const bootstrap = useCallback(async () => {
    if (!tokenStorage.hasSession()) {
      setStatus("unauthenticated");
      return;
    }
    setStatus("loading");
    try {
      const session = await authApi.session();
      setSession(session);
    } catch {
      tokenStorage.clear();
      clear();
    }
  }, [setSession, setStatus, clear]);

  const login = useMutation({
    mutationFn: async (vars: { email: string; password: string }) => {
      await authApi.login(vars.email, vars.password);
      return authApi.session();
    },
    onSuccess: (session) => setSession(session),
  });

  const logout = useCallback(() => {
    authApi.logout();
    clear();
  }, [clear]);

  return { user, status, bootstrap, login, logout };
}
