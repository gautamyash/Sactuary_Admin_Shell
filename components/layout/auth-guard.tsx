"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { LoadingScreen } from "@/components/common/spinner";
import { LOGIN_ROUTE } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";

/**
 * Client-side session guard for the protected route group.
 *
 * Hydrates the auth store from the existing cookie session on mount, shows a
 * loading screen while resolving, and redirects to the login route if the
 * session cannot be established. Next.js middleware performs the coarse edge
 * check (cookie presence); this guard performs the authoritative check by
 * validating the session against the backend and loading RBAC permissions.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status, bootstrap } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (status === "idle") void bootstrap();
  }, [status, bootstrap]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace(LOGIN_ROUTE);
  }, [status, router]);

  if (status === "authenticated") return <>{children}</>;
  return <LoadingScreen label="Loading your workspace…" />;
}
