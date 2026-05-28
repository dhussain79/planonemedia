export { auth as middleware } from "@/lib/auth-edge";

export const config = {
  matcher: ["/supplier/:path*", "/admin/:path*"],
};
