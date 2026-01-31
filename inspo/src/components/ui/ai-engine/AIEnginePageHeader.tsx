"use client";

import Link from "next/link";
import type React from "react";
import { Heading, Text } from "@/components/ui/form-components";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface AIEnginePageHeaderProps {
  title: string;
  description?: string;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export default function AIEnginePageHeader({
  title,
  description,
  breadcrumbItems,
  actions,
}: AIEnginePageHeaderProps) {
  return (
    <div className="dashboard-header" style={{ marginBottom: "2rem" }}>
      {breadcrumbItems?.length ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            fontSize: "0.75rem",
            color: "rgba(255, 255, 255, 0.55)",
            marginBottom: "0.5rem",
          }}
        >
          {breadcrumbItems.map((item, index) => (
            <span
              key={`${item.label}-${index}`}
              style={{ display: "flex", gap: "0.5rem" }}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    textDecoration: "none",
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <span style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                  {item.label}
                </span>
              )}
              {index < breadcrumbItems.length - 1 && (
                <span style={{ opacity: 0.4 }}>/</span>
              )}
            </span>
          ))}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <Heading
            level={1}
            style={{
              color: "#ffffff",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              marginBottom: "0.25rem",
            }}
          >
            {title}
          </Heading>
          {description ? (
            <Text
              style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "1.05rem" }}
            >
              {description}
            </Text>
          ) : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
    </div>
  );
}
