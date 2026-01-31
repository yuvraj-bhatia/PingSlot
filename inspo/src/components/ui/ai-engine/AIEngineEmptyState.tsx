"use client";

import type React from "react";
import { Text } from "@/components/ui/form-components";

interface AIEngineEmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function AIEngineEmptyState({
  title,
  description,
  icon,
  action,
}: AIEngineEmptyStateProps) {
  return (
    <div
      style={{
        padding: "1.5rem",
        borderRadius: "12px",
        border: "1px dashed rgba(255, 255, 255, 0.15)",
        background: "rgba(255, 255, 255, 0.03)",
        textAlign: "center",
      }}
    >
      {icon ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "rgba(59, 130, 246, 0.15)",
            color: "rgba(255, 255, 255, 0.9)",
            marginBottom: "0.75rem",
          }}
        >
          {icon}
        </div>
      ) : null}
      <Text style={{ color: "#ffffff", fontWeight: 600 }}>{title}</Text>
      {description ? (
        <Text
          style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.85rem" }}
        >
          {description}
        </Text>
      ) : null}
      {action ? <div style={{ marginTop: "0.75rem" }}>{action}</div> : null}
    </div>
  );
}
