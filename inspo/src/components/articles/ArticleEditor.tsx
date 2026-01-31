"use client";

import { FileText, Hash, Link as LinkIcon, Save, Type } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  FormField,
  Heading,
  Input,
  Label,
  Text,
  Textarea,
} from "@/components/ui/form-components";
import type { ArticleSummary } from "@/types/articles";

type ArticleForm = {
  title: string;
  slug: string;
  summary?: string;
  contentHtml: string;
  tags?: string;
  isPublished?: boolean;
};

export default function ArticleEditor({
  onSuccess,
}: {
  onSuccess?: (article: ArticleSummary) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<ArticleForm>();

  const slugValue = watch("slug");

  const onSubmit = async (values: ArticleForm) => {
    // Convert comma-separated tags into array
    const tags = values.tags
      ? values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const payload = {
      title: values.title,
      slug: values.slug,
      summary: values.summary,
      contentHtml: values.contentHtml,
      tags,
      isPublished: !!values.isPublished,
    };

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        if (onSuccess) onSuccess(created);
        reset();
      } else {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        alert(`❌ Error creating article: ${err.error || "unknown"}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Network error.");
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Title Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "1.5rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <Type
              className="h-4 w-4"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            />
            <Heading level={3} style={{ color: "#ffffff" }}>
              Article Title
            </Heading>
          </div>
          <FormField>
            <Label
              htmlFor="title"
              style={{ color: "rgba(255, 255, 255, 0.9)" }}
            >
              Title *
            </Label>
            <Input
              id="title"
              {...register("title", { required: true })}
              placeholder="How to use the dashboard..."
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                backdropFilter: "blur(10px)",
              }}
              onChange={(e) => {
                if (!slugValue) {
                  // Auto-generate slug if empty
                  setValue("slug", generateSlug(e.target.value));
                }
              }}
            />
          </FormField>
        </div>

        {/* Slug Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "1.5rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <LinkIcon
              className="h-4 w-4"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            />
            <Heading level={3} style={{ color: "#ffffff" }}>
              URL Slug
            </Heading>
          </div>
          <FormField>
            <Label htmlFor="slug" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
              Slug (URL-friendly) *
            </Label>
            <Input
              id="slug"
              {...register("slug", { required: true })}
              placeholder="how-to-use-dashboard"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                backdropFilter: "blur(10px)",
              }}
            />
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
              }}
            >
              This will be used in the article URL
            </Text>
          </FormField>
        </div>

        {/* Summary Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "1.5rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <FileText
              className="h-4 w-4"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            />
            <Heading level={3} style={{ color: "#ffffff" }}>
              Article Summary
            </Heading>
          </div>
          <FormField>
            <Label
              htmlFor="summary"
              style={{ color: "rgba(255, 255, 255, 0.9)" }}
            >
              Summary
            </Label>
            <Textarea
              id="summary"
              {...register("summary")}
              rows={3}
              placeholder="Brief description of what this article covers..."
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                backdropFilter: "blur(10px)",
              }}
            />
          </FormField>
        </div>

        {/* Content Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "1.5rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <FileText
              className="h-4 w-4"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            />
            <Heading level={3} style={{ color: "#ffffff" }}>
              Article Content
            </Heading>
          </div>
          <FormField>
            <Label
              htmlFor="contentHtml"
              style={{ color: "rgba(255, 255, 255, 0.9)" }}
            >
              Content (HTML) *
            </Label>
            <Textarea
              id="contentHtml"
              {...register("contentHtml", { required: true })}
              rows={12}
              placeholder="Write your article content here. You can use HTML for formatting."
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                fontFamily: "monospace",
                backdropFilter: "blur(10px)",
              }}
            />
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
              }}
            >
              You can use basic HTML tags for formatting (e.g., &lt;p&gt;,
              &lt;h1&gt;, &lt;ul&gt;, &lt;li&gt;)
            </Text>
          </FormField>
        </div>

        {/* Tags Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "1.5rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <Hash
              className="h-4 w-4"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            />
            <Heading level={3} style={{ color: "#ffffff" }}>
              Article Tags
            </Heading>
          </div>
          <FormField>
            <Label htmlFor="tags" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
              Tags
            </Label>
            <Input
              id="tags"
              {...register("tags")}
              placeholder="dashboard, tutorial, beginner"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                backdropFilter: "blur(10px)",
              }}
            />
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
              }}
            >
              Separate tags with commas
            </Text>
          </FormField>
        </div>

        {/* Actions Card */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "1.5rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <Save
              className="h-4 w-4"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
            />
            <Heading level={3} style={{ color: "#ffffff" }}>
              Publish Settings
            </Heading>
          </div>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                color: "rgba(255, 255, 255, 0.9)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                {...register("isPublished")}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              />
              Publish immediately
            </label>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(37, 99, 235, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(20px)",
              }}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Article"}
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
}
