import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = new URL(request.url);

  if (
    token &&
    (url.pathname === "/" ||
      url.pathname.startsWith("/signin") ||
      url.pathname.startsWith("/signup") ||
      url.pathname.startsWith("/verify-code"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    !token &&
    (url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/result") ||
      url.pathname.startsWith("/playground") ||
      url.pathname.startsWith("/profile"))
  ) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // check of result, it should be accessed only from the playground and result pages.
  if (token && url.pathname.match(/^\/result\/[^/]+$/)) {
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
