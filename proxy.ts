import { NextResponse, NextRequest } from "next/server";

import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = req.nextUrl;

  const isAuthRoute =
    pathname === "/" ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup");

  const protectedRoutes = ["/dashboard", "/result", "/playground", "/profile", "/gallery"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/signin", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
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
    "/gallery/:path*",
  ],
};
