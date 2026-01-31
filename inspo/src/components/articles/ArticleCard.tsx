"use client";
import { Calendar, Tag, User } from "lucide-react";
import Link from "next/link";
import { Heading, Text } from "@/components/ui/form-components";
import type { ArticleSummary } from "@/types/articles";

export default function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <div
      style={{
        cursor: "pointer",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "16px",
        padding: "1.5rem",
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease",
      }}
    >
      <Link
        href={`/articles/${article.slug}`}
        style={{ textDecoration: "none" }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <div
            style={{
              padding: "0.75rem",
              background: "rgba(37, 99, 235, 0.2)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Tag
              className="h-4 w-4"
              style={{ color: "rgba(255, 255, 255, 0.9)" }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <Heading
              level={3}
              style={{
                color: "#ffffff",
                marginBottom: "0.5rem",
                fontSize: "1.25rem",
              }}
            >
              {article.title || "Untitled Article"}
            </Heading>

            {article.summary && (
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  lineHeight: "1.5",
                  marginBottom: "1rem",
                }}
              >
                {article.summary}
              </Text>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                {article.tags.map((t: string) => (
                  <span
                    key={t}
                    style={{
                      padding: "0.25rem 0.75rem",
                      background: "rgba(37, 99, 235, 0.2)",
                      color: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <User
                  className="h-3 w-3"
                  style={{ color: "rgba(255, 255, 255, 0.5)" }}
                />
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "0.875rem",
                  }}
                >
                  {article.author
                    ? `${article.author.firstName} ${article.author.lastName}`
                    : "Unknown Author"}
                </Text>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Calendar
                  className="h-3 w-3"
                  style={{ color: "rgba(255, 255, 255, 0.5)" }}
                />
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "0.875rem",
                  }}
                >
                  {article.createdAt
                    ? new Date(article.createdAt).toLocaleDateString()
                    : "—"}
                </Text>
              </div>
              {!article.isPublished && (
                <span
                  style={{
                    padding: "0.25rem 0.5rem",
                    background: "rgba(239, 68, 68, 0.2)",
                    color: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  Draft
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
