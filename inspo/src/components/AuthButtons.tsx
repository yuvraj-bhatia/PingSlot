"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { GradientButton } from "./ui/gradient-button";

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div
        className="actions"
        style={{ display: "flex", gap: "1rem", alignItems: "center" }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
        <div
          style={{
            width: "60px",
            height: "20px",
            borderRadius: "4px",
            background: "rgba(255, 255, 255, 0.1)",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
      </div>
    );
  }

  if (session) {
    // Typed view of session user allowing custom fields
    const typedUser = session.user as {
      firstName?: string;
      name?: string;
      image?: string;
    };
    const firstName =
      typedUser?.firstName || typedUser?.name?.split(" ")[0] || "User";
    const profileImage = typedUser?.image;

    return (
      <div
        className="actions"
        style={{ display: "flex", gap: "1rem", alignItems: "center" }}
      >
        {/* User Avatar with Blue Gradient - Curved Rectangle */}
        <div
          className="user-badge"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0 0.75rem 0 0.25rem",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(0, 112, 243, 0.1)",
            border: "1px solid rgba(0, 112, 243, 0.3)",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(0, 112, 243, 0.15)",
          }}
        >
          {profileImage ? (
            <div
              style={{
                position: "relative",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                padding: "2px",
                background: "linear-gradient(135deg, #0070f3, #3b82f6)",
                boxShadow: "0 2px 8px rgba(0, 112, 243, 0.3)",
                flexShrink: 0,
              }}
            >
              <Image
                src={profileImage}
                alt={`${firstName}'s profile`}
                fill
                sizes="28px"
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  background: "rgba(5, 7, 20, 0.9)",
                }}
                unoptimized
              />
            </div>
          ) : (
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0070f3, #3b82f6)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "700",
                boxShadow: "0 2px 8px rgba(0, 112, 243, 0.3)",
                flexShrink: 0,
              }}
            >
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            style={{
              color: "#ffffff",
              fontWeight: "600",
              fontSize: "0.875rem",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            }}
          >
            {firstName}
          </span>
        </div>

        {/* Sign Out Button with Red Gradient */}
        <GradientButton
          onClick={() => signOut({ callbackUrl: "/SignIn" })}
          variant="default"
        >
          Sign Out
        </GradientButton>
        <style jsx>{`
          .user-badge:hover {
            background: rgba(0, 112, 243, 0.15);
            border-color: rgba(0, 112, 243, 0.5);
            box-shadow: 0 4px 16px rgba(0, 112, 243, 0.25);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="actions"
      style={{ display: "flex", gap: "1rem", alignItems: "center" }}
    >
      <GradientButton variant="variant" asChild>
        <Link href="/SignIn">Sign In</Link>
      </GradientButton>
      <GradientButton asChild>
        <Link href="/SignUp">Get started</Link>
      </GradientButton>
    </div>
  );
}
