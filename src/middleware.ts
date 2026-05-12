import { NextResponse } from "next/server";
import { authRoutes } from "./lib/authRoutes";

export default function middleware(req: any) {
  const { nextUrl } = req;
  const isLoggedIn = req.cookies.get("iBadi-token")?.value;
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
