// src/app/settings/security/page.tsx
"use client";

import { useState } from "react";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import {
  Button,
  Form,
  FormField,
  Heading,
  Input,
  Label,
  Text,
} from "@/components/ui/form-components";

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  // MFA state removed - feature not implemented
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Validation
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (!currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setPasswordError(data.error || "Failed to update password");
        return;
      }

      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (_err) {
      setPasswordError("An error occurred while updating your password");
    } finally {
      setIsLoading(false);
    }
  };

  // MFA handler removed - feature not implemented

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const getPasswordStrength = (
    password: string,
  ): { strength: number; label: string; color: string } => {
    let strength = 0;
    const patterns = {
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
      length: password.length >= 8,
    };

    Object.values(patterns).forEach((pattern) => {
      if (pattern) strength++;
    });

    const strengthMap: Record<number, { label: string; color: string }> = {
      0: { label: "Very Weak", color: "#ef4444" },
      1: { label: "Weak", color: "#f97316" },
      2: { label: "Fair", color: "#fbbf24" },
      3: { label: "Good", color: "#84cc16" },
      4: { label: "Strong", color: "#22c55e" },
      5: { label: "Very Strong", color: "#10b981" },
    };

    return { strength: (strength / 5) * 100, ...strengthMap[strength] };
  };

  const passwordStrength = getPasswordStrength(newPassword);

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
          Authentication & Security
        </Heading>
        <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "1.1rem" }}>
          Manage your password and security settings
        </Text>
      </div>

      {/* Password Management */}
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
          Password Management
        </Heading>

        {passwordSaved && (
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
            Password updated successfully
          </div>
        )}

        {passwordError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem",
              marginBottom: "1.5rem",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "10px",
              color: "#dc2626",
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
          >
            <span>✕</span>
            {passwordError}
          </div>
        )}

        <Form onSubmit={handlePasswordChange}>
          <FormField>
            <Label htmlFor="currentPassword">Current Password</Label>
            <div style={{ position: "relative" }}>
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  fontSize: "1rem",
                }}
              >
                {showPasswords.current ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </FormField>

          <FormField>
            <Label htmlFor="newPassword">New Password</Label>
            <div style={{ position: "relative" }}>
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  fontSize: "1rem",
                }}
              >
                {showPasswords.new ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </FormField>

          <FormField>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div style={{ position: "relative" }}>
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  fontSize: "1rem",
                }}
              >
                {showPasswords.confirm ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </FormField>

          {/* Password Strength Bar */}
          {newPassword && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <Text muted style={{ fontSize: "0.85rem" }}>
                  Password Strength
                </Text>
                <Text
                  muted
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: passwordStrength.color,
                  }}
                >
                  {passwordStrength.label}
                </Text>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  background: "var(--input-border)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${passwordStrength.strength}%`,
                    height: "100%",
                    background: passwordStrength.color,
                    borderRadius: "4px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setPasswordError("");
              }}
            >
              Cancel
            </Button>
          </div>
        </Form>

        <div
          style={{
            marginTop: "2rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--input-border)",
            color: "var(--muted)",
            fontSize: "0.875rem",
          }}
        >
          <Text muted>Last changed: Recently</Text>
        </div>
      </div>

      {/* Multi-Factor Authentication - COMING SOON */}
      <div className="content-card">
        <Heading
          level={2}
          style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}
        >
          Multi-Factor Authentication
        </Heading>

        {/* Coming Soon Notice */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem",
            marginBottom: "1.5rem",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "10px",
            color: "#60a5fa",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>🔒</span>
          <Text style={{ color: "#60a5fa", fontSize: "0.95rem" }}>
            Multi-factor authentication is coming soon. This feature is
            currently under development.
          </Text>
        </div>

        {/* SMS Authentication - Disabled */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            marginBottom: "1rem",
            background: "var(--hover-bg)",
            borderRadius: "10px",
            opacity: 0.5,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span style={{ fontSize: "1.2rem" }}>📱</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                SMS Authentication
              </div>
              <Text muted style={{ fontSize: "0.85rem" }}>
                Receive verification codes via text message (Coming Soon)
              </Text>
            </div>
          </div>
          <span
            style={{
              padding: "0.25rem 0.75rem",
              backgroundColor: "rgba(107, 114, 128, 0.2)",
              borderRadius: "12px",
              fontSize: "0.75rem",
              color: "var(--muted)",
            }}
          >
            Coming Soon
          </span>
        </div>

        {/* Authenticator App - Disabled */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            background: "var(--hover-bg)",
            borderRadius: "10px",
            opacity: 0.5,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span style={{ fontSize: "1.2rem" }}>🔐</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                Authenticator App
              </div>
              <Text muted style={{ fontSize: "0.85rem" }}>
                Use an authenticator app for enhanced security (Coming Soon)
              </Text>
            </div>
          </div>
          <span
            style={{
              padding: "0.25rem 0.75rem",
              backgroundColor: "rgba(107, 114, 128, 0.2)",
              borderRadius: "12px",
              fontSize: "0.75rem",
              color: "var(--muted)",
            }}
          >
            Coming Soon
          </span>
        </div>
      </div>
    </PageContent>
  );
}
