"use client";
import type { ArticleSummary } from "@/types/articles";
import ArticleCard from "./ArticleCard";

export default function ArticleList({
  articles,
}: {
  articles: ArticleSummary[];
}) {
  if (!articles || articles.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>No articles found.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
      }}
    >
      {articles.map((a) => (
        <ArticleCard key={a.id} article={a} />
      ))}
    </div>
  );
}
