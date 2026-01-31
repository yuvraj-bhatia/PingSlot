// apmac-ui/src/components/ui/ai-engine/AIEngineSidebar.tsx
"use client";

import {
  ArrowLeft,
  Brain,
  FileText,
  GitCompare,
  Home,
  Layers,
  LineChart,
  type LucideIcon,
  Rocket,
  ShieldCheck,
  Sliders,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  id: string;
  label: string;
  href: string;
  Icon: LucideIcon;
  comingSoon?: boolean;
};

const NAV_SECTIONS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Core",
    items: [
      { id: "overview", label: "Overview", href: "/ai-engine", Icon: Home },
      {
        id: "train",
        label: "Upload & Train",
        href: "/ai-engine/train",
        Icon: TrendingUp,
      },
      {
        id: "feature-analysis",
        label: "Feature Analysis",
        href: "/ai-engine/feature-analysis",
        Icon: Layers,
      },
      {
        id: "playground",
        label: "Prediction Playground",
        href: "/ai-engine/playground",
        Icon: Rocket,
      },
      {
        id: "compare",
        label: "Model Comparison",
        href: "/ai-engine/compare",
        Icon: GitCompare,
      },
    ],
  },
  {
    title: "Additional",
    items: [
      {
        id: "model-building",
        label: "Model Building",
        href: "/ai-engine/model-building",
        Icon: Sliders,
      },
      {
        id: "reliability",
        label: "Reliability",
        href: "/ai-engine/reliability",
        Icon: ShieldCheck,
      },
      {
        id: "predictions",
        label: "Predictions",
        href: "/ai-engine/predictions",
        Icon: Target,
      },
      {
        id: "report-generation",
        label: "Report Generation",
        href: "/ai-engine/report-generation",
        Icon: FileText,
      },
      {
        id: "visualization",
        label: "Visualization",
        href: "/ai-engine/visualization",
        Icon: LineChart,
      },
    ],
  },
];

export default function AIEngineSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/ai-engine") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

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
      aria-label="AI Engine sidebar"
      className="glass-effect"
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
        gap: 0,
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
      {/* Back to Dashboard - Top */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/dashboard"
          className="nav-link"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
            padding: "0.5rem",
            borderRadius: "8px",
            transition: "all 0.3s ease",
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.color = "rgba(255, 255, 255, 1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
          }}
        >
          <ArrowLeft size={18} style={{ flexShrink: 0 }} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
        }}
      >
        <Brain
          size={24}
          color="rgba(255, 255, 255, 0.9)"
          style={{ flexShrink: 0 }}
        />
        <h1 style={brandStyle}>AI Engine</h1>
      </div>

      {/* Navigation */}
      <nav
        aria-label="AI Engine navigation"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          paddingBottom: "1rem",
        }}
      >
        {NAV_SECTIONS.map((section, index) => (
          <div
            key={section.title}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              paddingTop: index === 0 ? 4 : 12,
            }}
          >
            <div
              style={{
                padding: "0 12px",
                fontSize: 11,
                color: "rgba(255, 255, 255, 0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              {section.title}
            </div>
            {section.items.map((item) => {
              const active = isActive(item.href);
              const IconComponent = item.Icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
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
                    minHeight: "52px",
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
                    <IconComponent
                      size={18}
                      color={active ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
                      strokeWidth={active ? 2.5 : 1.5}
                    />
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.comingSoon ? (
                    <span
                      style={{
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        padding: "0.2rem 0.4rem",
                        borderRadius: "999px",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "rgba(255, 255, 255, 0.6)",
                        background: "rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      Soon
                    </span>
                  ) : null}
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
          </div>
        ))}
      </nav>
    </aside>
  );
}
