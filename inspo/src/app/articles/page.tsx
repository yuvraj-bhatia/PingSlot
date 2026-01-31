"use client";

import { FileText, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import ArticleList from "@/components/articles/ArticleList";
import { Button, Heading, Input, Text } from "@/components/ui/form-components";
import type { ArticleSummary } from "@/types/articles";

export default function ArticlesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/SignIn");
    }
  }, [status, router]);

  const fetchArticles = useCallback(async (tag?: string) => {
    setLoading(true);
    try {
      const url = tag
        ? `/api/articles?tag=${encodeURIComponent(tag)}`
        : "/api/articles";
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setArticles(data);
      } else {
        console.error(
          "Unexpected API response format - expected array, got:",
          data,
        );
        setArticles([]);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(search);
  }, [fetchArticles, search]);

  if (status === "loading") {
    return (
      <div className="dashboard-container fade-in">
        <div className="loading">Loading articles...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div
      className="dashboard-container fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "4rem 2rem 2rem 2rem",
        minHeight: "100%",
      }}
    >
      {/* Header - matching dashboard styling */}
      <div
        className="dashboard-header"
        style={{ textAlign: "center", marginBottom: "2rem" }}
      >
        <Heading
          level={1}
          style={{
            color: "#ffffff",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          Help Articles
        </Heading>
        <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "1.1rem" }}>
          Learn how to use APTECH with our comprehensive guides and tutorials
        </Text>
      </div>

      {/* Search and Actions Card */}
      <div
        style={{
          width: "100%",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            padding: "2rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <Search
              className="h-5 w-5"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            />
            <Heading level={2} style={{ color: "#ffffff", margin: 0 }}>
              Find Help Articles
            </Heading>
          </div>

          {/* Search and Actions */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: "300px" }}>
              <Input
                placeholder="Search articles by tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  backdropFilter: "blur(10px)",
                }}
              />
            </div>
            <Button
              variant="primary"
              onClick={() => router.push("/articles/editor")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexShrink: 0,
                background: "rgba(37, 99, 235, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(20px)",
              }}
            >
              <Plus className="h-4 w-4" />
              Create Article
            </Button>
          </div>

          {/* Results */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Loading articles...
              </Text>
            </div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <FileText
                className="h-16 w-16"
                style={{
                  color: "rgba(255, 255, 255, 0.3)",
                  margin: "0 auto 1.5rem",
                }}
              />
              <Heading
                level={3}
                style={{
                  color: "#ffffff",
                  marginBottom: "0.5rem",
                }}
              >
                No articles found
              </Heading>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  marginBottom: "1.5rem",
                  lineHeight: "1.6",
                }}
              >
                {search
                  ? `No articles found with tag "${search}"`
                  : "No articles have been created yet"}
              </Text>
              <Button
                variant="primary"
                onClick={() => router.push("/articles/editor")}
                style={{
                  background: "rgba(37, 99, 235, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(20px)",
                }}
              >
                Create First Article
              </Button>
            </div>
          ) : (
            <ArticleList articles={articles} />
          )}
        </div>
      </div>
    </div>
  );
}
