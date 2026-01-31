"use client";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import type React from "react";
import { useEffect, useState } from "react";
import { AnimatedGradient } from "../../components/ui/AnimatedGradient";
import {
  Divider,
  Form,
  FormField,
  Heading,
  Input,
  Label,
  Text,
} from "../../components/ui/form-components";
import { Button, Card, OAuthButton } from "../../components/ui/primitives";

export default function SignUpPage() {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Step 1: Basic info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Profile setup
  const [_photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");

  // Step 3: Onboarding preferences
  const [watchTutorial, setWatchTutorial] = useState(true);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    const handleVisibilityChange = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Handle photo upload
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle feature selection
  function toggleFeature(feature: string) {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature],
    );
  }

  // Navigation
  function handleNext() {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  // Final submit
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          companyName,
          email,
          password,
          role,
          department,
          watchTutorial,
          selectedFeatures,
        }),
      });

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Registration failed" }));
        setError(data.error ?? "Registration failed");
        return;
      }

      await signIn("credentials", {
        redirect: true,
        email,
        password,
        callbackUrl: "/dashboard",
      });
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-hero fade-in">
      {mounted && isVisible && <AnimatedGradient />}
      <div className="signup-content-wrapper">
        <Card
          className="signup-card"
          style={{
            maxWidth: "600px",
            width: "100%",
            background: "rgba(30, 58, 138, 0.25)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderRadius: "24px",
            padding: "2.5rem",
            boxShadow:
              "0 20px 60px rgba(30, 58, 138, 0.4), 0 8px 24px rgba(30, 58, 138, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.3)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Logo and Heading */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <Image
                src="/logo/APTECH.png"
                alt="APTECH Logo"
                width={50}
                height={50}
                style={{ objectFit: "contain", cursor: "pointer" }}
              />
            </Link>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <Heading level={1} style={{ color: "#ffffff", marginBottom: 0 }}>
                Create your account
              </Heading>
              <Text style={{ color: "#ffffff", marginTop: "0.25rem" }}>
                Sign up to access APTECH features
              </Text>
            </div>
          </div>

          {/* Progress indicator */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    height: "4px",
                    backgroundColor:
                      step <= currentStep
                        ? "var(--brand-primary-600)"
                        : "var(--input-border)",
                    marginRight: step < totalSteps ? "0.5rem" : "0",
                    borderRadius: "2px",
                    transition: "background-color 0.3s ease",
                  }}
                />
              ))}
            </div>
            <Text
              style={{
                fontSize: "0.85rem",
                textAlign: "center",
                color: "#ffffff",
              }}
            >
              Step {currentStep} of {totalSteps}
            </Text>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <FormField>
                    <Label htmlFor="firstName" style={{ color: "#ffffff" }}>
                      First name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      name="firstName"
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </FormField>

                  <FormField>
                    <Label htmlFor="lastName" style={{ color: "#ffffff" }}>
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </FormField>
                </div>

                <FormField>
                  <Label htmlFor="companyName" style={{ color: "#ffffff" }}>
                    Company name
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    name="companyName"
                    placeholder="ACME Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </FormField>

                <FormField>
                  <Label htmlFor="email" style={{ color: "#ffffff" }}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormField>

                <FormField>
                  <Label htmlFor="password" style={{ color: "#ffffff" }}>
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Choose a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </FormField>

                {error && <div className="error">{error}</div>}

                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", marginTop: "0.5rem" }}
                >
                  {loading ? "Creating account..." : "Continue"}
                </Button>
              </Form>

              <Text
                className="text-center"
                style={{ fontSize: "0.9rem", color: "#ffffff" }}
              >
                Already have an account?{" "}
                <Link
                  href="/SignIn"
                  style={{
                    color: "#ffffff",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Sign in
                </Link>
              </Text>

              <Divider
                text="or"
                style={{ color: "#ffffff", marginTop: "1rem" }}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <OAuthButton provider="google" />
                <OAuthButton provider="microsoft" />
                <OAuthButton provider="outlook" />
              </div>

              <div className="seo-links">
                <Link
                  className="nav-link"
                  href="/settings/privacy"
                  style={{ color: "#ffffff" }}
                >
                  Privacy
                </Link>
                <Link
                  className="nav-link"
                  href="/support"
                  style={{ color: "#ffffff" }}
                >
                  Terms
                </Link>
                <Link
                  className="nav-link"
                  href="/support"
                  style={{ color: "#ffffff" }}
                >
                  Help
                </Link>
              </div>
            </>
          )}

          {/* Step 2: Profile setup */}
          {currentStep === 2 && (
            <>
              <Heading
                level={2}
                className="text-center"
                style={{ color: "#ffffff", marginBottom: "0.5rem" }}
              >
                Set up your profile
              </Heading>
              <Text className="text-center" style={{ color: "#ffffff" }}>
                Add a photo and your role details
              </Text>

              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
              >
                <FormField>
                  <Label htmlFor="photo" style={{ color: "#ffffff" }}>
                    Profile photo
                  </Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  {photoPreview && (
                    <Image
                      src={photoPreview}
                      alt="Preview"
                      width={96}
                      height={96}
                      unoptimized
                      style={{
                        marginTop: "0.75rem",
                        width: "96px",
                        height: "96px",
                        objectFit: "cover",
                        borderRadius: "9999px",
                        border: "1px solid var(--input-border)",
                      }}
                    />
                  )}
                </FormField>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <FormField>
                    <Label htmlFor="role" style={{ color: "#ffffff" }}>
                      Role
                    </Label>
                    <Input
                      id="role"
                      type="text"
                      name="role"
                      placeholder="Product Manager"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </FormField>

                  <FormField>
                    <Label htmlFor="department" style={{ color: "#ffffff" }}>
                      Department
                    </Label>
                    <Input
                      id="department"
                      type="text"
                      name="department"
                      placeholder="Operations"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </FormField>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <Button variant="outline" type="button" onClick={handleBack}>
                    Back
                  </Button>
                  <Button variant="primary" type="submit">
                    Continue
                  </Button>
                </div>
              </Form>
            </>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 3 && (
            <>
              <Heading
                level={2}
                className="text-center"
                style={{ color: "#ffffff", marginBottom: "0.5rem" }}
              >
                Choose your preferences
              </Heading>
              <Text className="text-center" style={{ color: "#ffffff" }}>
                Pick what you want to start with
              </Text>

              <Form onSubmit={onSubmit}>
                <FormField>
                  <Label htmlFor="watchTutorial" style={{ color: "#ffffff" }}>
                    Watch quick tutorial on first login?
                  </Label>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "center",
                    }}
                  >
                    <input
                      id="watchTutorial"
                      type="checkbox"
                      checked={watchTutorial}
                      onChange={(e) => setWatchTutorial(e.target.checked)}
                    />
                    <Text style={{ color: "#ffffff" }}>Recommended</Text>
                  </div>
                </FormField>

                <FormField>
                  <Label style={{ color: "#ffffff" }}>Features</Label>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                  >
                    {["Dashboard", "Tasks", "Calendar", "Analytics"].map(
                      (feat) => (
                        <button
                          key={feat}
                          type="button"
                          onClick={() => toggleFeature(feat)}
                          className="btn btn-outline btn-sm"
                          aria-pressed={selectedFeatures.includes(feat)}
                          style={{
                            borderColor: selectedFeatures.includes(feat)
                              ? "var(--brand-primary-600)"
                              : "var(--input-border)",
                            background: selectedFeatures.includes(feat)
                              ? "var(--hover-bg)"
                              : "transparent",
                          }}
                        >
                          {feat}
                        </button>
                      ),
                    )}
                  </div>
                </FormField>

                {error && <div className="error">{error}</div>}

                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <Button variant="outline" type="button" onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={loading}
                  >
                    {loading
                      ? "Creating account..."
                      : "Finish & Create Account"}
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Card>
      </div>
      <style jsx>{`
        .signup-hero {
          position: relative;
          overflow-x: hidden;
          background: transparent;
          min-height: 100vh;
        }

        .shader-gradient-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -1;
          pointer-events: none;
          overflow: hidden;
          opacity: 0.8;
        }

        .signup-content-wrapper {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 2rem 1rem;
          padding-top: 4rem;
        }

        .signup-card,
        .signup-card.card {
          width: 100% !important;
          max-width: 600px !important;
          background: rgba(30, 58, 138, 0.25) !important;
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-radius: 24px !important;
          padding: 2.5rem !important;
          box-shadow: 
            0 20px 60px rgba(30, 58, 138, 0.4),
            0 8px 24px rgba(30, 58, 138, 0.3),
            0 0 0 1px rgba(59, 130, 246, 0.3) !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 1.25rem !important;
          border: 1px solid rgba(59, 130, 246, 0.4) !important;
          position: relative;
          z-index: 10;
        }

        .signup-card :global(.input) {
          background: rgba(30, 58, 138, 0.2) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.3) !important;
          color: #ffffff !important;
        }

        .signup-card :global(.input:focus) {
          background: rgba(30, 58, 138, 0.3) !important;
          border-color: rgba(96, 165, 250, 0.7) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3) !important;
        }

        .signup-card :global(.input::placeholder) {
          color: rgba(255, 255, 255, 0.5) !important;
        }

        .signup-card :global(.error) {
          background: rgba(239, 68, 68, 0.2) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(239, 68, 68, 0.4) !important;
          color: #fca5a5 !important;
        }

        .signup-card :global(label) {
          color: #ffffff !important;
        }

        .signup-card :global(.text),
        .signup-card :global(.muted) {
          color: rgba(255, 255, 255, 0.8) !important;
        }
      `}</style>
    </div>
  );
}
