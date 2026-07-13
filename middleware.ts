import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIES, LOGIN_ROUTE } from "@/config/site";

/**
 * Edge middleware: coarse authentication routing.
 *
 * This is the first (cheap) gate — it only checks for the presence of an access
 * cookie to decide between the auth flow and the app. The authoritative check
 * (validating the session and loading RBAC permissions) happens client-side in
 * `AuthGuard`, and every data mutation is enforced by the Django backend.
 *
 *  - No session + protected route  → redirect to /login
 *  - Has session + on /login       → redirect home
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIES.access)?.value);
  const isLogin = pathname === LOGIN_ROUTE;

  if (!hasSession && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_ROUTE;
    return NextResponse.redirect(url);
  }

  if (hasSession && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals, API routes, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
