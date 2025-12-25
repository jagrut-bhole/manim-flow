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

  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup", "/verify-code/:path*"],
};
