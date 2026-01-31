// src/app/settings/permissions/page.tsx
"use client";

import { PageContent } from "@/components/ui/dashboard/PageContent";
import { Button, Heading, Text } from "@/components/ui/form-components";

export default function PermissionsSettingsPage() {
  return (
    <PageContent>
      {/* Header */}
      <div
        className="dashboard-header"
        style={{ textAlign: "left", marginBottom: "2rem" }}
      >
        <Heading
          level={1}
          style={{
            marginBottom: "0.5rem",
            color: "#ffffff",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          Role & Permissions
        </Heading>
        <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "1.1rem" }}>
          View your current role and available permissions
        </Text>
      </div>

      {/* Current Role */}
      <div
        className="content-card"
        style={{
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "var(--brand-primary-600)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            👤
          </div>
          <div>
            <Heading
              level={2}
              style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}
            >
              Current Role: Administrator
            </Heading>
            <Text muted>Full system access</Text>
          </div>
        </div>
      </div>

      {/* Permissions Overview */}
      <div
        className="content-card"
        style={{
          marginBottom: "2rem",
        }}
      >
        <Heading
          level={2}
          style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}
        >
          Permissions Overview
        </Heading>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}
        >
          {[
            {
              title: "User Management",
              description: "Create, edit, and delete users",
              icon: "👥",
              enabled: true,
            },
            {
              title: "Content Management",
              description: "Manage all content and settings",
              icon: "📝",
              enabled: true,
            },
            {
              title: "System Configuration",
              description: "Configure system settings",
              icon: "⚙️",
              enabled: true,
            },
            {
              title: "Analytics Access",
              description: "View analytics and reports",
              icon: "📊",
              enabled: true,
            },
            {
              title: "Billing Management",
              description: "Manage billing and subscriptions",
              icon: "💳",
              enabled: true,
            },
            {
              title: "Team Settings",
              description: "Manage team and roles",
              icon: "👨‍💼",
              enabled: true,
            },
          ].map((permission) => (
            <div
              key={permission.title}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                background: "var(--hover-bg)",
                borderRadius: "10px",
                border: "1px solid var(--input-border)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <span style={{ fontSize: "1.5rem" }}>{permission.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                    {permission.title}
                  </div>
                  <Text muted style={{ fontSize: "0.85rem" }}>
                    {permission.description}
                  </Text>
                </div>
              </div>
              <span
                style={{
                  fontSize: "1.5rem",
                  color: permission.enabled ? "#16a34a" : "#9ca3af",
                }}
              >
                {permission.enabled ? "✓" : "✕"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Request Temporary Permissions */}
      <div
        className="content-card"
        style={{
          marginBottom: "2rem",
        }}
      >
        <Heading
          level={2}
          style={{ marginBottom: "0.5rem", fontSize: "1.25rem" }}
        >
          Need More Permissions?
        </Heading>
        <Text muted style={{ marginBottom: "1.5rem" }}>
          Request temporary elevated permissions for specific tasks
        </Text>
        <Button variant="outline">🔐 Request Temporary Permissions</Button>
      </div>

      {/* Role Information */}
      <div
        style={{
          background: "rgba(37, 99, 235, 0.08)",
          borderRadius: "14px",
          padding: "2rem",
          border: "1px solid rgba(37, 99, 235, 0.2)",
        }}
      >
        <Heading
          level={3}
          style={{
            fontSize: "1rem",
            marginBottom: "0.5rem",
            color: "var(--brand-primary-600)",
          }}
        >
          ℹ️ About Your Role
        </Heading>
        <Text
          style={{ fontSize: "0.95rem", color: "var(--brand-primary-600)" }}
        >
          As an Administrator, you have full access to all features and
          settings. Your permissions cannot be changed by other users. Contact
          your organization's support team if you need to modify your role.
        </Text>
      </div>
    </PageContent>
  );
}
