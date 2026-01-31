"use client";

import { Construction } from "lucide-react";
import type React from "react";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-cards";
import { Text } from "@/components/ui/form-components";

interface AIEngineComingSoonProps {
  title?: string;
  description?: string;
  bullets?: string[];
  action?: React.ReactNode;
}

export default function AIEngineComingSoon({
  title = "Under implementation",
  description = "This area is being finalized for the demo experience.",
  bullets = [
    "Polished UI and consistent metrics",
    "Clear empty-state handling",
    "Dashboard-grade cards and layouts",
  ],
  action,
}: AIEngineComingSoonProps) {
  return (
    <DashboardCard
      icon={<Construction className="h-4 w-4" />}
      title={title}
      description={
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>
            {description}
          </Text>
          <ul
            style={{
              listStyle: "disc",
              paddingLeft: "1.25rem",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {action ? <div>{action}</div> : null}
        </div>
      }
      minHeight="12rem"
    />
  );
}
