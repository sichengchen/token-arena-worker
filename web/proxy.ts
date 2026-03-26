import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/usage", "/settings"];
const AUTH_PAGES = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hasSessionCookie = Boolean(getSessionCookie(request));
  const isProtectedPath = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isInvalidSessionBounce = searchParams.get("invalid") === "1";

  if (isProtectedPath && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && hasSessionCookie && !isInvalidSessionBounce) {
    return NextResponse.redirect(new URL("/usage", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/usage/:path*", "/settings/:path*", "/login"],
};
