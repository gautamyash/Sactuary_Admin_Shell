/**
 * Static application metadata and environment-derived configuration.
 *
 * The API base URL resolves from NEXT_PUBLIC_API_URL and falls back to the
 * currently deployed Django backend. The backend remains the single source
 * of truth; the web admin is purely a client.
 */

export const siteConfig = {
  name: "Sanctuary Health",
  shortName: "Sanctuary",
  description: "Hospital administration portal for Sanctuary Health.",
  hospital: "City General Hospital",
} as const;

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://sanctuary-backend-r01p.onrender.com";

/** Cookie names used to persist the JWT pair on the web client. */
export const AUTH_COOKIES = {
  access: "sh_access",
  refresh: "sh_refresh",
} as const;

/** Route the app treats as "home" once authenticated. */
export const HOME_ROUTE = "/";
export const LOGIN_ROUTE = "/login";
