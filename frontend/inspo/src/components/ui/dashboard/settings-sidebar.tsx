// src/components/ui/dashboard/settings-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";

export type SettingsSectionId =
  | "profile"
  | "security"
  | "notifications"
  | "privacy"
  | "permissions"
  | "audits";

const SETTINGS_SECTIONS: Array<{
  id: SettingsSectionId;
  label: string;
  href: string;
  Icon: React.FC<{ active?: boolean }>;
}> = [
  {
    id: "profile",
    label: "Profile Information",
    href: "/settings/profile",
    Icon: ProfileIcon,
  },
  {
    id: "security",
    label: "Authentication & Security",
    href: "/settings/security",
    Icon: SecurityIcon,
  },
  {
    id: "notifications",
    label: "Notification Preferences",
    href: "/settings/notifications",
    Icon: NotificationIcon,
  },
  {
    id: "privacy",
    label: "Privacy & Data",
    href: "/settings/privacy",
    Icon: PrivacyIcon,
  },
  {
    id: "permissions",
    label: "Role & Permissions",
    href: "/settings/permissions",
    Icon: PermissionsIcon,
  },
  {
    id: "audits",
    label: "Audit Log",
    href: "/settings/audit",
    Icon: SecurityIcon,
  },
];

export default function SettingsSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside
      aria-label="Settings sidebar"
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
      {/* Back Button */}
      <Link
        href="/dashboard"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          marginBottom: "0.5rem",
          color: "rgba(255, 255, 255, 0.8)",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
          transition: "all 0.3s ease",
          borderRadius: "8px",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.color = "rgba(255, 255, 255, 1)";
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>←</span>
        Back to Dashboard
      </Link>

      {/* Settings Title */}
      <div style={{ marginBottom: "0.5rem" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: "0.25rem",
            color: "rgba(255, 255, 255, 1)",
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.5)" }}>
          Manage your account and preferences
        </p>
      </div>

      {/* Settings Menu */}
      <nav
        aria-label="Settings navigation"
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {SETTINGS_SECTIONS.map(({ id, label, href, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={id}
              href={href}
              aria-current={active ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 12px",
                borderRadius: 10,
                userSelect: "none",
                textDecoration: "none",
                color: active ? "#ffffff" : "rgba(255, 255, 255, 0.8)",
                fontWeight: active ? 600 : 500,
                background: active ? "rgba(0, 112, 243, 0.15)" : "transparent",
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
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
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
                    background: "linear-gradient(180deg, #0070f3, #3b82f6)",
                    borderRadius: "0 2px 2px 0",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

/* Icon Components */
function ProfileIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Profile</title>
      <path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="7"
        r="4"
        stroke={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
      />
    </svg>
  );
}

function SecurityIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Security</title>
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function NotificationIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Notifications</title>
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
        strokeLinecap="round"
      />
      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function PrivacyIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Privacy</title>
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
      />
    </svg>
  );
}

function PermissionsIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Permissions</title>
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
        strokeLinecap="round"
      />
      <circle
        cx="9"
        cy="7"
        r="4"
        stroke={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
      />
      <path
        d="M23 11h-6"
        stroke={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
        strokeLinecap="round"
      />
      <path
        d="M23 17h-6"
        stroke={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        strokeWidth={active ? 2.5 : 1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
