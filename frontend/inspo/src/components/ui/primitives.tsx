"use client";

import { signIn } from "next-auth/react";
import type React from "react";
import { GoogleIcon, MicrosoftIcon, OutlookIcon } from "./icons";

// Re-export from form-components for backward compatibility
export { Button, Card } from "./form-components";

export const OAuthButton: React.FC<{
  provider: "google" | "microsoft" | "outlook";
  onClick?: () => void;
}> = ({ provider, onClick }) => {
  const map = {
    google: {
      label: "Continue with Google",
      className: "oauth-google",
      Icon: GoogleIcon,
    },
    microsoft: {
      label: "Continue with Microsoft",
      className: "oauth-microsoft",
      Icon: MicrosoftIcon,
    },
    outlook: {
      label: "Continue with Outlook",
      className: "oauth-outlook",
      Icon: OutlookIcon,
    },
  } as const;
  const info = map[provider];
  const Icon = info.Icon;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (provider === "google") {
      // Google OAuth is enabled
      signIn("google", { callbackUrl: "/dashboard" });
    } else {
      // Microsoft/Outlook are not yet implemented
      console.warn(`${provider} OAuth is not yet configured`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={provider !== "google"}
      className={`oauth-btn ${info.className}`}
    >
      <span className="oauth-icon">
        <Icon />
      </span>
      <span className="oauth-text">{info.label}</span>
    </button>
  );
};
