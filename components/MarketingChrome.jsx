"use client";
import { usePathname } from "next/navigation";

export default function MarketingChrome({ children }) {
  const pathname = usePathname();
  const privateRoutes = ["/members", "/coach", "/admin", "/login", "/client-join", "/join", "/checkout", "/reset-password", "/update-password"];
  if (privateRoutes.some(route => pathname === route || pathname?.startsWith(route + "/"))) return null;
  return children;
}
