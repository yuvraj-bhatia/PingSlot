"use client";

import type React from "react";
import { Heading, Text } from "../form-components";
import { GlowingEffect } from "../glowing-effect";

interface KPICardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtext?: string;
  minHeight?: string;
}

export function KPICard({
  icon,
  title,
  value,
  subtext,
  minHeight = "10rem",
}: KPICardProps) {
  const isPositive = subtext?.startsWith("↑");
  const isNegative = subtext?.startsWith("↓");

  return (
    <div className="relative" style={{ minHeight }}>
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-white/10 p-2">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="content-card relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-xl p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <div
                style={{
                  width: "fit-content",
                  borderRadius: "8px",
                  border: "0.75px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  color: "rgba(255, 255, 255, 0.9)",
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <Text
                style={{
                  fontSize: "0.875rem",
                  lineHeight: "1.25rem",
                  color: "rgba(255, 255, 255, 0.6)",
                }}
              >
                {title}
              </Text>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <Heading
                level={2}
                style={{
                  color: "#ffffff",
                  marginBottom: 0,
                  fontSize: "2rem",
                  lineHeight: "2.5rem",
                  fontWeight: 700,
                }}
              >
                {value}
              </Heading>
              {subtext && (
                <Text
                  style={{
                    fontSize: "0.75rem",
                    lineHeight: "1rem",
                    color: isPositive
                      ? "rgba(34, 197, 94, 0.9)"
                      : isNegative
                        ? "rgba(239, 68, 68, 0.9)"
                        : "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  {subtext}
                </Text>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  minHeight?: string;
  contentGap?: string;
}

export function DashboardCard({
  icon,
  title,
  description,
  minHeight = "14rem",
  contentGap = "gap-6",
}: DashboardCardProps) {
  return (
    <div className="relative" style={{ minHeight }}>
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-white/10 p-2">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div
          className={`content-card relative flex h-full flex-col justify-between ${contentGap} overflow-hidden rounded-xl p-6`}
        >
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <div
                style={{
                  width: "fit-content",
                  borderRadius: "8px",
                  border: "0.75px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  color: "rgba(255, 255, 255, 0.9)",
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <Heading
                level={2}
                style={{
                  color: "#ffffff",
                  marginBottom: 0,
                  fontSize: "1.25rem",
                  lineHeight: "1.375rem",
                  fontWeight: 600,
                }}
              >
                {title}
              </Heading>
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                lineHeight: "1.25rem",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              {description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  meta: string;
}

export function ActivityItem({
  icon,
  title,
  description,
  meta,
}: ActivityItemProps) {
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
      <div
        style={{
          borderRadius: "8px",
          border: "0.75px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(255, 255, 255, 0.05)",
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          color: "rgba(255, 255, 255, 0.9)",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
          flex: 1,
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "0.875rem",
          }}
        >
          {description}
        </Text>
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "0.75rem",
            marginTop: "0.25rem",
          }}
        >
          {meta}
        </Text>
      </div>
    </div>
  );
}
