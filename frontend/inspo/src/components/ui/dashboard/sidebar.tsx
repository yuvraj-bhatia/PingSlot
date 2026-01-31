// src/components/ui/dashboard/sidebar.tsx
"use client";

import {
  Brain,
  Building2,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type React from "react";
import { GradientButton } from "../gradient-button";

export type SidebarItemId =
  | "dashboard"
  | "analytics"
  | "aiModels"
  | "settings"
  | "organization"
  | "support";

const NAV: Array<{
  id: SidebarItemId;
  label: string;
  href: string;
  Section:
    | "Overview"
    | "Insights"
    | "AI"
    | "Account"
    | "Organization"
    | "Support";
  Icon: React.FC<{ active?: boolean }>;
}> = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    Section: "Overview",
    Icon: ({ active }) => (
      <LayoutDashboard
        size={18}
        color={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
      />
    ),
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/analytics",
    Section: "Insights",
    Icon: ({ active }) => (
      <LineChart
        size={18}
        color={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
      />
    ),
  },
  {
    id: "aiModels",
    label: "AI Engine",
    href: "/ai-engine",
    Section: "AI",
    Icon: ({ active }) => (
      <Brain
        size={18}
        color={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
      />
    ),
  },
  {
    id: "organization",
    label: "Organization",
    href: "/dashboard/organization",
    Section: "Organization",
    Icon: ({ active }) => (
      <Building2
        size={18}
        color={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
      />
    ),
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    Section: "Account",
    Icon: ({ active }) => (
      <Settings
        size={18}
        color={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
      />
    ),
  },
  {
    id: "support",
    label: "Support",
    href: "/support",
    Section: "Support",
    Icon: ({ active }) => (
      <HelpCircle
        size={18}
        color={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
      />
    ),
  },
];

export default function SidebarNav({ className }: { className?: string }) {
  const pathname = usePathname();

  // Group items by section
  const groups = NAV.reduce<Record<string, typeof NAV>>((acc, item) => {
    const group = acc[item.Section] ?? [];
    group.push(item);
    acc[item.Section] = group;
    return acc;
  }, {});

  const brandStyle = {
    fontFamily:
      'var(--font-space-grotesk, "Space Grotesk", ui-sans-serif, system-ui, sans-serif)',
    fontSize: "1.25rem",
    fontWeight: 700,
    letterSpacing: "0.5px",
    color: "#ffffff",
    lineHeight: 1.1,
    margin: 0,
    padding: 0,
  } as const;

  return (
    <aside
      aria-label="Main sidebar"
      className={`glass-effect ${className || ""}`}
      style={{
        width: 280,
        minHeight: "100vh",
        padding: "4rem 1rem 1.5rem 1rem",
        boxSizing: "border-box",
        borderRight: "1px solid rgba(255, 255, 255, 0.04)",
        background: "transparent",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        color: "rgba(255, 255, 255, 0.9)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        borderRadius: "0",
        borderLeft: "none",
        borderTop: "none",
        borderBottom: "none",
        boxShadow: "6px 0 16px rgba(2, 6, 23, 0.28)",
        zIndex: 2,
      }}
    >
      {/* Brand */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          textDecoration: "none",
          padding: "0.5rem",
          borderRadius: "8px",
          transition: "all 0.3s ease",
          marginBottom: "0.5rem",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.02)";
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <Image
          src="/logo/APTECH.png"
          alt="APTECH Logo"
          width={32}
          height={32}
          style={{ objectFit: "contain", flexShrink: 0 }}
        />
        <h1 style={brandStyle}>APTECH</h1>
      </Link>

      {/* Sections */}
      {(
        [
          "Overview",
          "Insights",
          "AI",
          "Organization",
          "Account",
          "Support",
        ] as const
      ).map((section) =>
        (groups[section]?.length ?? 0) > 0 ? (
          <div
            key={section}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <div
              style={{
                marginTop: section === "Overview" ? 0 : 8,
                marginBottom: 4,
                padding: "6px 12px",
                fontSize: 11,
                color: "rgba(255, 255, 255, 0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                fontWeight: 600,
              }}
            >
              {section}
            </div>

            <nav
              aria-label={`${section} navigation`}
              style={{ display: "flex", flexDirection: "column", gap: 4 }}
            >
              {groups[section].map(({ id, label, href, Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={id}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 10,
                      userSelect: "none",
                      textDecoration: "none",
                      color: active ? "#ffffff" : "rgba(255, 255, 255, 0.8)",
                      fontWeight: active ? 600 : 500,
                      background: active
                        ? "rgba(0, 112, 243, 0.15)"
                        : "transparent",
                      transition: "all 0.3s ease",
                      position: "relative",
                      fontSize: "0.95rem",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.05)";
                        e.currentTarget.style.color = "rgba(255, 255, 255, 1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color =
                          "rgba(255, 255, 255, 0.8)";
                      }
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        display: "inline-flex",
                        width: 20,
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon active={active} />
                    </span>
                    <span>{label}</span>
                    {active && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "3px",
                          height: "60%",
                          background:
                            "linear-gradient(180deg, #0070f3, #3b82f6)",
                          borderRadius: "0 2px 2px 0",
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null,
      )}

      {/* Spacer to push Sign Out to bottom */}
      <div style={{ flex: 1 }} />

      {/* Sign Out Button at Bottom */}
      <GradientButton
        type="button"
        onClick={() => signOut({ callbackUrl: "/SignIn" })}
        variant="default"
        className="w-full mt-4"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <LogOut size={16} />
        <span>Sign Out</span>
      </GradientButton>
    </aside>
  );
}

/** URL → active helper */
function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Icons are now using lucide-react components defined inline in NAV array
