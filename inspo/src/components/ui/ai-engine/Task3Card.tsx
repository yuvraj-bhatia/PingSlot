"use client";

import { FileText } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-cards";
import { Button, Text } from "@/components/ui/form-components";

export type Task3Result = {
  ok: boolean;
  report_md?: string;
  error?: string;
};

export type Task3Payload = {
  dataset_id: string;
  model_id: string;
};

export type Task3CardProps = {
  onRunTask3?: (payload: Task3Payload) => Promise<Task3Result>;
  datasets?: Array<{ dataset_id: string; name: string }>;
  models?: Array<{ model_id: string; name: string }>;
};

const Task3Card: React.FC<Task3CardProps> = ({
  onRunTask3,
  datasets = [],
  models = [],
}) => {
  const [datasetId, setDatasetId] = useState<string>("");
  const [modelId, setModelId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);

    if (!datasetId || !modelId) {
      setError("Please select a dataset and a model.");
      return;
    }
    if (!onRunTask3) {
      setError("Task 3 API not wired.");
      return;
    }

    try {
      setLoading(true);

      const res = await onRunTask3({
        dataset_id: datasetId,
        model_id: modelId,
      });

      if (!res.ok || !res.report_md) {
        setError(res.error || "Failed to generate report.");
        return;
      }

      // Convert markdown → PDF via backend route
      const pdfRes = await fetch("/api/ai-engine/task-3/convert", {
        method: "POST",
        body: JSON.stringify({ markdown: res.report_md }),
        headers: { "Content-Type": "application/json" },
      });

      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ai-report.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (_err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: "0.625rem 0.875rem",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    fontSize: "0.875rem",
  };

  return (
    <DashboardCard
      icon={<FileText className="h-4 w-4" />}
      title="Task 3 – Generate PDF Report"
      minHeight="16rem"
      description={
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Text
            style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.7)" }}
          >
            Select dataset and model to generate a full PDF business report.
          </Text>

          {/* Dataset */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <Text
              style={{
                fontSize: "0.875rem",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              Select Dataset
            </Text>
            <select
              style={inputStyle}
              value={datasetId}
              onChange={(e) => setDatasetId(e.target.value)}
            >
              <option value="">Choose...</option>
              {datasets?.map((d) => (
                <option key={d.dataset_id} value={d.dataset_id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <Text
              style={{
                fontSize: "0.875rem",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              Select Model
            </Text>
            <select
              style={inputStyle}
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
            >
              <option value="">Choose...</option>
              {models?.map((m) => (
                <option key={m.model_id} value={m.model_id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div
              style={{
                padding: "0.6rem 0.75rem",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                color: "rgba(239, 68, 68, 0.9)",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading}
            style={{ width: "100%", marginTop: "0.25rem" }}
          >
            {loading ? "Generating..." : "Generate PDF Report"}
          </Button>
        </div>
      }
    />
  );
};

export default Task3Card;
