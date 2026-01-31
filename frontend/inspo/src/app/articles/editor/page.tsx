"use client";

import { CheckCircle, Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import ArticleEditor from "@/components/articles/ArticleEditor";
import { Button, Heading, Text } from "@/components/ui/form-components";

export default function ArticleEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [successMsg, setSuccessMsg] = useState("");

  if (status === "loading") {
    return (
      <div className="dashboard-container fade-in">
        <div className="loading">Loading editor...</div>
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
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
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
          Create Article
        </Heading>
        <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "1.1rem" }}>
          Create a new help article for the knowledge base
        </Text>
      </div>

      {/* Back Button */}
      <div style={{ marginBottom: "2rem" }}>
        <Button
          variant="ghost"
          onClick={() => router.push("/articles")}
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
          ← Back to Articles
        </Button>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div
          style={{
            marginBottom: "2rem",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "12px",
            padding: "1rem 1.5rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle
              className="h-5 w-5"
              style={{ color: "rgba(34, 197, 94, 0.9)" }}
            />
            <Text
              style={{ color: "rgba(34, 197, 94, 0.9)", fontWeight: "500" }}
            >
              {successMsg}
            </Text>
          </div>
        </div>
      )}

      {/* Editor Card */}
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
            marginBottom: "2rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            paddingBottom: "1.5rem",
          }}
        >
          <Edit3
            className="h-5 w-5"
            style={{ color: "rgba(255, 255, 255, 0.7)" }}
          />
          <Heading level={2} style={{ color: "#ffffff", margin: 0 }}>
            Article Editor
          </Heading>
        </div>

        <ArticleEditor
          onSuccess={(article) => {
            setSuccessMsg("Article saved successfully!");
            setTimeout(() => {
              router.push(`/articles/${article.slug}`);
            }, 1500);
          }}
        />
      </div>
    </div>
  );
}
