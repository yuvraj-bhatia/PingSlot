// src/app/settings/privacy/page.tsx
"use client";

import { useState } from "react";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import { Button, Heading, Text } from "@/components/ui/form-components";

export default function PrivacySettingsPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

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
          Privacy & Data
        </Heading>
        <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "1.1rem" }}>
          Manage your data, privacy settings, and account status
        </Text>
      </div>

      {/* Data Export */}
      <div
        className="content-card"
        style={{
          marginBottom: "2rem",
        }}
      >
        <Heading
          level={2}
          style={{ marginBottom: "1rem", fontSize: "1.25rem" }}
        >
          Data Export
        </Heading>
        <Text muted style={{ marginBottom: "1.5rem" }}>
          Download a copy of your data in a portable format
        </Text>
        <Button variant="outline">📥 Export My Data</Button>
      </div>

      {/* Account Status */}
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
          Account Status
        </Heading>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          <Button
            variant="outline"
            onClick={() => setShowDeactivateConfirm(!showDeactivateConfirm)}
          >
            Deactivate Account
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
          >
            Delete Account
          </Button>
        </div>

        {/* Deactivate Confirmation */}
        {showDeactivateConfirm && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              background: "rgba(251, 191, 36, 0.1)",
              border: "1px solid rgba(251, 191, 36, 0.3)",
              borderRadius: "10px",
              color: "#d97706",
            }}
          >
            <Heading
              level={3}
              style={{
                fontSize: "1rem",
                marginBottom: "0.5rem",
                color: "#d97706",
              }}
            >
              Deactivate Your Account?
            </Heading>
            <Text
              style={{
                fontSize: "0.9rem",
                marginBottom: "1rem",
                color: "#d97706",
              }}
            >
              Your account will be temporarily disabled. You can reactivate it
              anytime by logging in.
            </Text>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeactivateConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                style={{
                  background: "#d97706",
                  color: "white",
                  border: "none",
                }}
              >
                Yes, Deactivate
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div
            style={{
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "10px",
              color: "#dc2626",
            }}
          >
            <Heading
              level={3}
              style={{
                fontSize: "1rem",
                marginBottom: "0.5rem",
                color: "#dc2626",
              }}
            >
              ⚠️ Permanently Delete Your Account?
            </Heading>
            <Text
              style={{
                fontSize: "0.9rem",
                marginBottom: "1rem",
                color: "#dc2626",
              }}
            >
              This action cannot be undone. All your data will be permanently
              deleted from our servers.
            </Text>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                }}
              >
                Yes, Delete Everything
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Data Permissions Summary */}
      <div className="content-card">
        <Heading
          level={2}
          style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}
        >
          What We Collect
        </Heading>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
          }}
        >
          {[
            {
              title: "Essential Data",
              description:
                "Email, name, and account settings required for service",
              enabled: true,
            },
            {
              title: "Usage Analytics",
              description: "How you use APMAC to improve our service",
              enabled: true,
            },
            {
              title: "Device Information",
              description: "Browser, OS, and device type for compatibility",
              enabled: true,
            },
            {
              title: "Marketing Data",
              description: "Campaign performance and engagement metrics",
              enabled: false,
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                padding: "1rem",
                background: "var(--hover-bg)",
                borderRadius: "10px",
                border: "1px solid var(--input-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                    {item.title}
                  </div>
                  <Text muted style={{ fontSize: "0.85rem" }}>
                    {item.description}
                  </Text>
                </div>
                <span style={{ fontSize: "1.5rem" }}>
                  {item.enabled ? "✓" : "✕"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--input-border)",
          }}
        >
          <Button variant="outline">View Privacy Policy</Button>
        </div>
      </div>
    </PageContent>
  );
}
