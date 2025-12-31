import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const url = new URL(request.url);

  if (
    session &&
    (url.pathname === "/" ||
      url.pathname.startsWith("/signin") ||
      url.pathname.startsWith("/signup") ||
      url.pathname.startsWith("/verify-code"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    !session &&
    (url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/result") ||
      url.pathname.startsWith("/playground") ||
      url.pathname.startsWith("/profile"))
  ) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // check of result, it should be accessed only from the playground and result pages.
  if (session && url.pathname.match(/^\/result\/[^/]+$/)) {
    const referer = request.headers.get("referer");
    const isFromPlayground = referer?.includes("/playground");
    const isFromResult = referer?.includes("/result");

    if (!referer || (!isFromPlayground && !isFromResult)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/signin",
    "/signup",
    "/verify-code/:path*",
    "/result/:path*",
    "/playground/:path*",
    "/profile/:path*",
  ],
};
