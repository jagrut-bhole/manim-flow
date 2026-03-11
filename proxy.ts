import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  // NextAuth v5 changed the cookie name from "next-auth.session-token"
  // to "authjs.session-token" (HTTP) or "__Secure-authjs.session-token" (HTTPS)
  const isSecure = req.nextUrl.protocol === "https:";
  const cookieName = isSecure
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName,
  });

  const { pathname } = req.nextUrl;

  const isAuthRoute =
    pathname === "/" ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup");

  const protectedRoutes = [
    "/dashboard",
    "/result",
    "/playground",
    "/profile",
    "/gallery",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Signed-in user visiting landing / signin / signup → send to dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Unauthenticated user visiting a protected route → send to signin
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
