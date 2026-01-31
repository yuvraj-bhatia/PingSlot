"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import ApiHealthPill from "./ApiHealthPill";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  currentPath: string;
  showNav?: boolean;
  align?: "left" | "center";
  titleSize?: string;
  showHealth?: boolean;
  showIcon?: boolean;
}

const NAV_LINKS = [
  { label: "Train", href: "/ai-engine/train" },
  { label: "History", href: "/ai-engine/predictions" },
  { label: "Feature Analysis", href: "/ai-engine/feature-analysis" },
  { label: "Compare", href: "/ai-engine/compare" },
  { label: "Playground", href: "/ai-engine/playground" },
];

export default function PageHeader({
  icon: Icon,
  title,
  description,
  currentPath,
  showNav = true,
  align = "left",
  titleSize = "2rem",
  showHealth = true,
  showIcon = true,
}: PageHeaderProps) {
  const isCentered = align === "center";

  return (
    <div style={{ marginBottom: "2rem" }}>
      {/* Title Section - Match Dashboard Style */}
      <div
        className="dashboard-header"
        style={{
          textAlign: isCentered ? "center" : "left",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isCentered ? "column" : "row",
            alignItems: "center",
            justifyContent: isCentered ? "center" : "space-between",
            gap: isCentered ? "0.75rem" : undefined,
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: showIcon ? "0.75rem" : 0,
              justifyContent: isCentered ? "center" : undefined,
            }}
          >
            {showIcon && (
              <div
                style={{
                  width: "fit-content",
                  borderRadius: "8px",
                  border: "0.75px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  color: "rgba(255, 255, 255, 0.9)",
                }}
              >
                <Icon size={20} color="rgba(255, 255, 255, 0.9)" />
              </div>
            )}
            <h1
              style={{
                color: "#ffffff",
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                margin: 0,
                fontSize: titleSize,
                fontWeight: 700,
              }}
            >
              {title}
            </h1>
          </div>
          {showHealth ? (
            isCentered ? (
              <div style={{ marginTop: "0.25rem" }}>
                <ApiHealthPill />
              </div>
            ) : (
              <ApiHealthPill />
            )
          ) : null}
        </div>
        <p
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "1.1rem",
            margin: 0,
            marginTop: "0.5rem",
          }}
        >
          {description}
        </p>
      </div>

      {/* Navigation Pills - Modern Tab Style */}
      {showNav && (
        <nav
          style={{
            display: "flex",
            gap: "0.5rem",
            padding: "0.35rem",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            width: "fit-content",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          {NAV_LINKS.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "0.625rem 1.25rem",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  background: isActive
                    ? "rgba(0, 112, 243, 0.15)"
                    : "transparent",
                  color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.8)",
                  border: isActive
                    ? "1px solid rgba(0, 112, 243, 0.3)"
                    : "1px solid transparent",
                  boxShadow: isActive
                    ? "0 2px 8px rgba(0, 112, 243, 0.25)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
