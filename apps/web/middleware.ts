import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEMO_ACCESS_COOKIE } from "@/lib/demo-access";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/signin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/demo-access") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (request.cookies.get(DEMO_ACCESS_COOKIE)?.value === "1") {
    return NextResponse.next();
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
