// src/app/settings/notifications/page.tsx
"use client";

import { useState } from "react";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import { Button, Heading, Text } from "@/components/ui/form-components";

export default function NotificationsSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailFrequency, setEmailFrequency] = useState("daily");
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [dataAnalytics, setDataAnalytics] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
          Notification Preferences
        </Heading>
        <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "1.1rem" }}>
          Choose how and when you want to receive notifications
        </Text>
      </div>

      {saved && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem",
            marginBottom: "1.5rem",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "10px",
            color: "#16a34a",
            fontSize: "0.95rem",
            fontWeight: 500,
          }}
        >
          <span>✓</span>
          Your preferences have been saved
        </div>
      )}

      {/* Email & Push Notifications */}
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
          Communication Methods
        </Heading>

        {/* Email Notifications Toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            marginBottom: "1rem",
            background: "var(--hover-bg)",
            borderRadius: "10px",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
              Email Notifications
            </div>
            <Text muted style={{ fontSize: "0.85rem" }}>
              Receive updates via email
            </Text>
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              style={{
                width: "48px",
                height: "28px",
                cursor: "pointer",
                appearance: "none",
                background: emailNotifications
                  ? "var(--brand-primary-600)"
                  : "#d1d5db",
                borderRadius: "14px",
                position: "relative",
                transition: "background 0.3s ease",
              }}
            />
          </label>
        </div>

        {/* Push Notifications Toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            background: "var(--hover-bg)",
            borderRadius: "10px",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
              Push Notifications
            </div>
            <Text muted style={{ fontSize: "0.85rem" }}>
              Receive in-app notifications
            </Text>
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              style={{
                width: "48px",
                height: "28px",
                cursor: "pointer",
                appearance: "none",
                background: pushNotifications
                  ? "var(--brand-primary-600)"
                  : "#d1d5db",
                borderRadius: "14px",
                position: "relative",
                transition: "background 0.3s ease",
              }}
            />
          </label>
        </div>
      </div>

      {/* Email Frequency */}
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
          Email Frequency
        </Heading>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {[
            { value: "immediate", label: "Immediate" },
            { value: "daily", label: "Daily Digest" },
            { value: "weekly", label: "Weekly Summary" },
          ].map((option) => (
            <label
              key={option.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem",
                background:
                  emailFrequency === option.value
                    ? "rgba(37, 99, 235, 0.08)"
                    : "var(--hover-bg)",
                border:
                  emailFrequency === option.value
                    ? "2px solid var(--brand-primary-600)"
                    : "1px solid transparent",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <input
                type="radio"
                name="emailFrequency"
                value={option.value}
                checked={emailFrequency === option.value}
                onChange={(e) => setEmailFrequency(e.target.value)}
                style={{
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "var(--brand-primary-600)",
                }}
              />
              <span style={{ fontWeight: 500 }}>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Data Permissions */}
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
          Data Permissions
        </Heading>

        {/* Marketing Communications */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            marginBottom: "1rem",
            background: "var(--hover-bg)",
            borderRadius: "10px",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
              Marketing Communications
            </div>
            <Text muted style={{ fontSize: "0.85rem" }}>
              Receive promotional emails
            </Text>
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={marketingEmails}
              onChange={(e) => setMarketingEmails(e.target.checked)}
              style={{
                width: "48px",
                height: "28px",
                cursor: "pointer",
                appearance: "none",
                background: marketingEmails
                  ? "var(--brand-primary-600)"
                  : "#d1d5db",
                borderRadius: "14px",
                position: "relative",
                transition: "background 0.3s ease",
              }}
            />
          </label>
        </div>

        {/* Data Analytics */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            background: "var(--hover-bg)",
            borderRadius: "10px",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
              Data Analytics
            </div>
            <Text muted style={{ fontSize: "0.85rem" }}>
              Allow usage tracking
            </Text>
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={dataAnalytics}
              onChange={(e) => setDataAnalytics(e.target.checked)}
              style={{
                width: "48px",
                height: "28px",
                cursor: "pointer",
                appearance: "none",
                background: dataAnalytics
                  ? "var(--brand-primary-600)"
                  : "#d1d5db",
                borderRadius: "14px",
                position: "relative",
                transition: "background 0.3s ease",
              }}
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <Button variant="primary" onClick={handleSave}>
          Save Preferences
        </Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </PageContent>
  );
}
