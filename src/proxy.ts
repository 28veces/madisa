import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session;
  const role = session?.user?.role;

  if (!isLoggedIn) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/super") && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/super") && role === "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/admin/super", req.url));
  }

  if (pathname === "/login") {
    const destination = role === "SUPER_ADMIN" ? "/admin/super" : "/admin";
    return NextResponse.redirect(new URL(destination, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
