// src/app/settings/profile/page.tsx
"use client";

import { useSession } from "next-auth/react";
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

export default function ProfileSettingsPage() {
  const { data: session, update: updateSession } = useSession();

  const sessionUser = session?.user;
  const firstNameFromSession =
    sessionUser && typeof sessionUser === "object" && "firstName" in sessionUser
      ? ((sessionUser as { firstName?: string }).firstName ?? "")
      : "";
  const fullNameFromSession = sessionUser?.name ?? "";

  const [firstName, setFirstName] = useState(firstNameFromSession);
  const [lastName, setLastName] = useState(
    fullNameFromSession.split(" ").slice(1).join(" ") || "",
  );
  const [email, setEmail] = useState(session?.user?.email || "");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(
    session?.user?.image || null,
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to update profile");
        return;
      }

      // Update session
      await updateSession({
        user: {
          ...session?.user,
          firstName,
          name: `${firstName} ${lastName}`,
          email,
        },
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (_err) {
      setError("An error occurred while updating your profile");
    } finally {
      setIsLoading(false);
    }
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
          Profile Information
        </Heading>
        <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "1.1rem" }}>
          Update your personal details and profile picture
        </Text>
      </div>

      {/* Success Message */}
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
            animation: "fadeIn 0.3s ease",
          }}
        >
          <span>✓</span>
          Your profile has been updated successfully
        </div>
      )}

      {/* Error Message */}
      {error && (
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
          {error}
        </div>
      )}

      {/* Profile Card */}
      <div
        className="content-card"
        style={{
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Profile Image */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: profileImage
                  ? `url(${profileImage})`
                  : "var(--brand-primary-600)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "3rem",
                fontWeight: 700,
                marginBottom: "1rem",
                border: "3px solid var(--brand-primary-600)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {!profileImage && (firstName?.charAt(0) || "?").toUpperCase()}
            </div>
            <label
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                background: "var(--hover-bg)",
                border: "1px solid var(--input-border)",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--foreground)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(37, 99, 235, 0.12)";
                e.currentTarget.style.borderColor = "var(--brand-primary-600)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--hover-bg)";
                e.currentTarget.style.borderColor = "var(--input-border)";
              }}
            >
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {/* Form Fields */}
          <Form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <FormField>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </FormField>

              <FormField>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </FormField>
            </div>

            <FormField>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </FormField>

            <FormField>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </FormField>

            <div
              style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}
            >
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                style={{ minWidth: "120px" }}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </PageContent>
  );
}
