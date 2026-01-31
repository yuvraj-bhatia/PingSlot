"use client";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import type React from "react";
import { useEffect, useState } from "react";
import { DitheringShader } from "../../components/ui/dithering-shader";
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

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mountFrame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(mountFrame);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else if (res?.ok) {
        window.location.href = "/dashboard";
      }
    } catch (_err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in signin-page-container">
      {mounted && (
        <div className="fixed inset-0 z-0 pointer-events-none w-screen h-screen">
          <DitheringShader
            shape="wave"
            type="8x8"
            colorBack="#000000"
            colorFront="#3b82f6"
            pxSize={3}
            speed={0.4}
            className="w-full h-full"
          />
        </div>
      )}
      <div className="signin-content-wrapper">
        <Card
          className="signin-card"
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
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
            <Heading
              level={1}
              className="text-center"
              style={{ color: "#ffffff", marginBottom: 0 }}
            >
              Login to APTECH
            </Heading>
          </div>

          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <OAuthButton provider="google" />
            <OAuthButton provider="microsoft" />
            <OAuthButton provider="outlook" />
          </div>

          <Divider text="or" style={{ color: "#ffffff" }} />

          <Form onSubmit={onSubmit}>
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
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormField>

            <div style={{ textAlign: "right", marginTop: "-0.5rem" }}>
              <Link
                href="/"
                style={{
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </Link>
            </div>

            {error && <div className="error">{error}</div>}

            <Button
              variant="outline"
              size="lg"
              type="submit"
              disabled={loading}
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </Form>

          <Text
            className="text-center"
            style={{ fontSize: "0.9rem", color: "#ffffff" }}
          >
            Don't have an account?{" "}
            <Link
              href="/SignUp"
              style={{
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Sign up
            </Link>
          </Text>

          <div className="seo-links">
            <Link
              className="nav-link"
              href="/settings/privacy"
              style={{ color: "#ffffff" }}
            >
              Privacy
            </Link>
            <Link className="nav-link" href="/" style={{ color: "#ffffff" }}>
              Terms
            </Link>
            <Link className="nav-link" href="/" style={{ color: "#ffffff" }}>
              Help
            </Link>
          </div>
        </Card>
      </div>
      <style jsx>{`
        .signin-page-container {
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
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          opacity: 1;
        }

        .signin-content-wrapper {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 2rem 1rem;
          padding-top: 4rem;
        }

        .signin-card,
        .signin-card.card {
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

        .signin-card :global(.input) {
          background: rgba(30, 58, 138, 0.2) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.3) !important;
          color: #ffffff !important;
        }

        .signin-card :global(.input:focus) {
          background: rgba(30, 58, 138, 0.3) !important;
          border-color: rgba(96, 165, 250, 0.7) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3) !important;
        }

        .signin-card :global(.input::placeholder) {
          color: rgba(255, 255, 255, 0.5) !important;
        }

        .signin-card :global(.error) {
          background: rgba(239, 68, 68, 0.2) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(239, 68, 68, 0.4) !important;
          color: #fca5a5 !important;
        }
      `}</style>
    </div>
  );
}
