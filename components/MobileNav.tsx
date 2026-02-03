"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Bell, Settings } from "lucide-react";
import { cn } from "../lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/targets", label: "Targets", icon: Target },
];

/**
 * MobileNav - Bottom navigation bar for mobile devices.
 * Fixed to bottom of screen, hidden on desktop.
 * Provides quick access to main sections.
 */
export function MobileNav() {
  const pathname = usePathname();

  // Don't show on landing page
  if (pathname === "/landing") {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      aria-label="Mobile navigation"
    >
      {/* Backdrop blur effect */}
      <div
        className="absolute inset-0 border-t border-white/[0.08]"
        style={{
          background: "rgba(10, 10, 10, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      />

      {/* Glow effect at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 10%, rgba(0, 212, 255, 0.3) 50%, transparent 90%)",
        }}
      />

      {/* Navigation items */}
      <div className="relative flex items-center justify-around px-4 py-2 safe-area-pb">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive
                  ? "text-accent"
                  : "text-foreground-muted hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                  isActive && "bg-accent/15"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive && "scale-110"
                  )}
                />
                {/* Active indicator dot */}
                {isActive && (
                  <span
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent"
                    style={{
                      boxShadow: "0 0 8px rgba(0, 212, 255, 0.6)",
                    }}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-70"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Safe area padding utility for mobile devices with notches/home indicators
 */
const safeAreaStyles = `
  .safe-area-pb {
    padding-bottom: env(safe-area-inset-bottom, 0.5rem);
  }
`;

// Inject safe area styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = safeAreaStyles;
  document.head.appendChild(styleSheet);
}
