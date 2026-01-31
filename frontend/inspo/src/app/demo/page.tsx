import Link from "next/link";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import { Heading, Text } from "@/components/ui/form-components";

export const dynamic = "force-dynamic";

const ROUTES = [
  {
    href: "/",
    label: "Home",
    description: "Marketing landing page.",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Primary KPI dashboard and activity feed.",
  },
  {
    href: "/ai-engine",
    label: "AI Engine",
    description: "Overview of AI engine capabilities.",
  },
  {
    href: "/ai-engine/playground",
    label: "AI Playground",
    description: "Try model predictions with sample inputs.",
  },
  {
    href: "/ai-engine/reliability",
    label: "Reliability",
    description: "Model and dataset reliability scoring.",
  },
  {
    href: "/analytics",
    label: "Analytics",
    description: "Model analytics and summaries.",
  },
  {
    href: "/support",
    label: "Support",
    description: "Support tickets and knowledge base.",
  },
];

const ENV_VARS = [
  { key: "NEXTAUTH_URL", required: true },
  { key: "NEXTAUTH_SECRET", required: true },
  { key: "GOOGLE_CLIENT_ID", required: false },
  { key: "GOOGLE_CLIENT_SECRET", required: false },
  { key: "ML_API_BASE_URL", required: false },
  { key: "APTECH_API_KEY", required: false },
  { key: "DEMO_MODE", required: false },
];

export default function DemoPage() {
  const demoMode = process.env.DEMO_MODE === "1";
  const envStatus = ENV_VARS.map((env) => ({
    ...env,
    present: Boolean(process.env[env.key]),
  }));

  return (
    <PageContent>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          maxWidth: "900px",
        }}
      >
        <div>
          <Heading level={1} style={{ color: "#ffffff" }}>
            Demo & UI Smoke Test
          </Heading>
          <Text muted style={{ marginTop: "0.5rem" }}>
            Use this page to quickly navigate core routes and validate that the
            UI renders locally before pushing.
          </Text>
        </div>

        <section>
          <Heading level={2} style={{ marginBottom: "0.75rem" }}>
            Key Routes
          </Heading>
          <div
            style={{
              display: "grid",
              gap: "0.75rem",
            }}
          >
            {ROUTES.map((route) => (
              <div
                key={route.href}
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "0.9rem 1.1rem",
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div>
                  <Text style={{ color: "#ffffff", fontWeight: 600 }}>
                    {route.label}
                  </Text>
                  <Text muted style={{ fontSize: "0.85rem" }}>
                    {route.description}
                  </Text>
                </div>
                <Link
                  href={route.href}
                  style={{
                    color: "var(--brand-primary-400)",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Open →
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <Heading level={2} style={{ marginBottom: "0.75rem" }}>
            Environment Status
          </Heading>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "1rem 1.25rem",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            {envStatus.map((env) => (
              <div
                key={env.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.35rem 0",
                }}
              >
                <Text style={{ color: "#ffffff" }}>
                  {env.key}
                  {env.required ? " (required)" : ""}
                </Text>
                <Text
                  style={{
                    color: env.present
                      ? "rgba(34, 197, 94, 0.9)"
                      : "rgba(239, 68, 68, 0.9)",
                  }}
                >
                  {env.present ? "Present" : "Missing"}
                </Text>
              </div>
            ))}
          </div>
          <Text muted style={{ marginTop: "0.5rem" }}>
            This section only indicates whether values exist, not their
            contents.
          </Text>
        </section>

        <section>
          <Heading level={2} style={{ marginBottom: "0.75rem" }}>
            Demo Mode
          </Heading>
          <Text muted>DEMO_MODE is {demoMode ? "enabled" : "disabled"}.</Text>
          {demoMode && (
            <div
              style={{
                marginTop: "0.75rem",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(34, 197, 94, 0.08)",
                padding: "0.9rem 1.1rem",
              }}
            >
              <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                Mock data is enabled for the demo page only. You can validate UI
                flows without hitting external services.
              </Text>
            </div>
          )}
        </section>
      </div>
    </PageContent>
  );
}
