/**
 * Web token storage.
 *
 * Tokens are kept in cookies (not httpOnly) so that Next.js middleware can
 * perform a coarse authenticated/unauthenticated check at the edge. This is a
 * deliberate foundation-stage tradeoff: a hardened setup would move the refresh
 * token to an httpOnly cookie set by a Next route handler acting as a token
 * broker. That hardening is tracked as a follow-up, not built in this phase.
 *
 * All access is guarded for SSR (no `document` on the server).
 */

import { AUTH_COOKIES } from "@/config/site";

const isBrowser = () => typeof document !== "undefined";

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (!isBrowser()) return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function getCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function deleteCookie(name: string) {
  if (!isBrowser()) return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

// Access token: short-lived. Refresh token: long-lived.
const ACCESS_MAX_AGE = 60 * 30; // 30 minutes
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const tokenStorage = {
  getAccess: () => getCookie(AUTH_COOKIES.access),
  getRefresh: () => getCookie(AUTH_COOKIES.refresh),
  setTokens(access: string, refresh?: string) {
    setCookie(AUTH_COOKIES.access, access, ACCESS_MAX_AGE);
    if (refresh) setCookie(AUTH_COOKIES.refresh, refresh, REFRESH_MAX_AGE);
  },
  clear() {
    deleteCookie(AUTH_COOKIES.access);
    deleteCookie(AUTH_COOKIES.refresh);
  },
  hasSession: () => Boolean(getCookie(AUTH_COOKIES.access) || getCookie(AUTH_COOKIES.refresh)),
};
