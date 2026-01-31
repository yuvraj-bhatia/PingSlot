import parse from "html-react-parser";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import { Button, Heading, Text } from "@/components/ui/form-components";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArticleView({ params }: Props) {
  // Unwrap the params promise
  const { slug } = await params;

  const article = await prisma.helpArticle.findUnique({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!article) {
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
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Heading
            level={1}
            style={{
              color: "#ffffff",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              marginBottom: "1rem",
            }}
          >
            Article Not Found
          </Heading>
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              marginBottom: "2rem",
              fontSize: "1.1rem",
            }}
          >
            The article you're looking for doesn't exist or may have been moved.
          </Text>
          <Link href="/articles">
            <Button
              variant="primary"
              style={{
                background: "rgba(37, 99, 235, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(20px)",
              }}
            >
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const sanitizedContent = sanitizeHtml(article.contentHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });

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
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      }}
    >
      {/* Back Button */}
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/articles">
          <Button
            variant="ghost"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "rgba(255, 255, 255, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Button>
        </Link>
      </div>

      {/* Article Content Card */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
          padding: "2rem",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Article Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <Tag
              className="h-5 w-5"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            />
            <Heading
              level={1}
              style={{
                color: "#ffffff",
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              }}
            >
              {article.title}
            </Heading>
          </div>

          {/* Article Metadata */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "2rem",
              alignItems: "center",
              marginBottom: "2rem",
              paddingBottom: "1.5rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <User
                className="h-4 w-4"
                style={{ color: "rgba(255, 255, 255, 0.5)" }}
              />
              <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                By{" "}
                {article.author
                  ? `${article.author.firstName} ${article.author.lastName}`
                  : "Unknown Author"}
              </Text>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Calendar
                className="h-4 w-4"
                style={{ color: "rgba(255, 255, 255, 0.5)" }}
              />
              <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                {new Date(article.createdAt).toLocaleDateString()}
              </Text>
            </div>
          </div>

          {/* Summary */}
          {article.summary && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "1.5rem",
                marginBottom: "2rem",
                backdropFilter: "blur(10px)",
              }}
            >
              <Heading
                level={3}
                style={{
                  color: "#ffffff",
                  marginBottom: "0.5rem",
                }}
              >
                Summary
              </Heading>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  lineHeight: "1.6",
                  fontSize: "1.1rem",
                }}
              >
                {article.summary}
              </Text>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <Heading
                level={3}
                style={{
                  color: "#ffffff",
                  marginBottom: "1rem",
                }}
              >
                Tags
              </Heading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "rgba(37, 99, 235, 0.2)",
                      color: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "20px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Article Content */}
        <div>
          <Heading
            level={2}
            style={{
              color: "#ffffff",
              marginBottom: "1rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              paddingBottom: "0.5rem",
            }}
          >
            Content
          </Heading>
          <div
            className="article-content"
            style={{
              lineHeight: "1.7",
              fontSize: "1.1rem",
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            {parse(sanitizedContent)}
          </div>
        </div>
      </div>
    </div>
  );
}
