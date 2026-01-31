"use client";

import { usePathname } from "next/navigation";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/SignIn" || pathname === "/SignUp";

  // Pages with their own layouts (sidebars) - no wrapper needed
  const hasOwnLayout =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/analytics") ||
    pathname?.startsWith("/ai-engine");

  if (hasOwnLayout) {
    return <>{children}</>;
  }

  return (
    <main
      className="main-content site-container"
      style={{ paddingTop: isAuthPage ? "0" : "80px" }}
    >
      {children}
    </main>
  );
}
