"use client";

import { useEffect, useState } from "react";

type HealthStatus = "healthy" | "degraded" | "down" | "loading";

export default function ApiHealthPill() {
  const [status, setStatus] = useState<HealthStatus>("loading");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_ML_API_BASE || "http://localhost:8000";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${baseUrl}/health`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          setStatus("healthy");
        } else {
          setStatus("degraded");
        }
      } catch (_error) {
        setStatus("down");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    loading: { label: "API: Checking...", color: "var(--muted)" },
    healthy: { label: "API: Healthy", color: "var(--success)" },
    degraded: { label: "API: Degraded", color: "var(--warning)" },
    down: { label: "API: Down", color: "var(--error)" },
  };

  const { label, color } = statusConfig[status];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.4rem 0.8rem",
        borderRadius: "10px",
        border: "1px solid var(--input-border)",
        background: "var(--input-bg)",
        fontSize: "0.875rem",
        fontWeight: 600,
        color: color,
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
      {label}
    </div>
  );
}
