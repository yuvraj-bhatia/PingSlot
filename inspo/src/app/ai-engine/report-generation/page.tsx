"use client";

import { Download, FileDown, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AIEngineEmptyState from "@/components/ui/ai-engine/AIEngineEmptyState";
import AIEnginePageHeader from "@/components/ui/ai-engine/AIEnginePageHeader";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-cards";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import { Button, Text } from "@/components/ui/form-components";
import {
  createReport,
  type DatasetSummary,
  downloadReportPdf,
  listDatasets,
  listModels,
  type ModelSummary,
  previewReport,
  type ReportPreviewResponse,
  type StakeholderReportRequest,
} from "@/lib/ai-engine/api";

export default function ReportGenerationPage() {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [loadingModels, setLoadingModels] = useState(true);
  const [datasetsError, setDatasetsError] = useState("");
  const [modelsError, setModelsError] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [modelId, setModelId] = useState("");
  const [audience, setAudience] =
    useState<StakeholderReportRequest["audience"]>("leadership");
  const [report, setReport] = useState<ReportPreviewResponse | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoadingDatasets(true);
    setDatasetsError("");

    listDatasets()
      .then((data) => {
        if (!isMounted) return;
        setDatasets(data);
        if (data.length > 0) {
          setDatasetId((prev) => prev || data[0].dataset_id);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setDatasetsError(
          err instanceof Error ? err.message : "Failed to load datasets",
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoadingDatasets(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoadingModels(true);
    setModelsError("");

    listModels()
      .then((data) => {
        if (!isMounted) return;
        setModels(data);
        if (data.length > 0) {
          setModelId((prev) => prev || data[0].model_id);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setModelsError(
          err instanceof Error ? err.message : "Failed to load models",
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoadingModels(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectionValid = useMemo(
    () => Boolean(datasetId && modelId),
    [datasetId, modelId],
  );

  const handleGenerate = async () => {
    if (!selectionValid) {
      setError("Please select both a dataset and model.");
      return;
    }

    setLoadingReport(true);
    setError("");
    setReport(null);

    try {
      const response = await previewReport({
        datasetId,
        modelId,
        audience,
      });
      setReport(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate stakeholder report",
      );
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!report?.markdown) return;
    const blob = new Blob([report.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "stakeholder-report.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (!selectionValid) {
      setError("Please select both a dataset and model.");
      return;
    }
    setPdfLoading(true);
    setError("");

    try {
      const response = await createReport({
        datasetId,
        modelId,
        audience,
      });
      setReport(response);

      if (!response.report_id) {
        throw new Error("Report generation did not return an ID.");
      }

      const pdfBlob = await downloadReportPdf(response.report_id);
      const url = URL.createObjectURL(pdfBlob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "stakeholder-report.pdf";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "PDF export is being finalized",
      );
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <PageContent>
      <div>
        <AIEnginePageHeader
          title="Report Generation"
          description="Generate stakeholder-ready markdown reports and export PDFs."
          breadcrumbItems={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "AI Engine", href: "/ai-engine" },
            { label: "Report Generation" },
          ]}
        />

        <div className="dashboard-grid">
          <DashboardCard
            icon={<FileText className="h-4 w-4" />}
            title="Stakeholder Report Builder"
            minHeight="20rem"
            description={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <label className="field-label" htmlFor="report-dataset">
                    Dataset
                  </label>
                  <select
                    id="report-dataset"
                    className="input"
                    value={datasetId}
                    onChange={(event) => setDatasetId(event.target.value)}
                    disabled={loadingDatasets}
                  >
                    <option value="">Select dataset</option>
                    {datasets.map((dataset) => (
                      <option
                        key={dataset.dataset_id}
                        value={dataset.dataset_id}
                      >
                        {dataset.name}
                      </option>
                    ))}
                  </select>
                  {loadingDatasets && (
                    <Text muted style={{ fontSize: "0.8rem" }}>
                      Loading datasets...
                    </Text>
                  )}
                  {datasetsError && (
                    <Text
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(239, 68, 68, 0.9)",
                      }}
                    >
                      {datasetsError}
                    </Text>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <label className="field-label" htmlFor="report-model">
                    Model
                  </label>
                  <select
                    id="report-model"
                    className="input"
                    value={modelId}
                    onChange={(event) => setModelId(event.target.value)}
                    disabled={loadingModels}
                  >
                    <option value="">Select model</option>
                    {models.map((model) => (
                      <option key={model.model_id} value={model.model_id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  {loadingModels && (
                    <Text muted style={{ fontSize: "0.8rem" }}>
                      Loading models...
                    </Text>
                  )}
                  {modelsError && (
                    <Text
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(239, 68, 68, 0.9)",
                      }}
                    >
                      {modelsError}
                    </Text>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <label className="field-label" htmlFor="report-audience">
                    Audience
                  </label>
                  <select
                    id="report-audience"
                    className="input"
                    value={audience}
                    onChange={(event) =>
                      setAudience(
                        event.target
                          .value as StakeholderReportRequest["audience"],
                      )
                    }
                  >
                    <option value="ops">Operations</option>
                    <option value="leadership">Leadership</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>

                {error && <div className="error">{error}</div>}

                <Button onClick={handleGenerate} disabled={loadingReport}>
                  {loadingReport ? "Generating..." : "Generate Report"}
                </Button>
              </div>
            }
          />

          <DashboardCard
            icon={<FileDown className="h-4 w-4" />}
            title="Report Preview"
            minHeight="20rem"
            description={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {loadingReport ? (
                  <div className="loading">Generating report...</div>
                ) : !report ? (
                  <AIEngineEmptyState
                    title="No reports generated yet"
                    description="Generate a stakeholder report to see the preview."
                  />
                ) : (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        background: "rgba(255, 255, 255, 0.02)",
                      }}
                    >
                      <div>
                        <Text muted style={{ fontSize: "0.75rem" }}>
                          Generated at
                        </Text>
                        <Text style={{ fontSize: "0.85rem" }}>
                          {report.metadata?.generated_at ?? "n/a"}
                        </Text>
                      </div>
                      <div>
                        <Text muted style={{ fontSize: "0.75rem" }}>
                          Model used
                        </Text>
                        <Text style={{ fontSize: "0.85rem" }}>
                          {report.metadata?.model?.name ??
                            report.metadata?.model?.id ??
                            "n/a"}
                        </Text>
                      </div>
                      <div>
                        <Text muted style={{ fontSize: "0.75rem" }}>
                          Dataset used
                        </Text>
                        <Text style={{ fontSize: "0.85rem" }}>
                          {report.metadata?.dataset?.name ??
                            report.metadata?.dataset?.id ??
                            "n/a"}
                        </Text>
                      </div>
                    </div>

                    <div
                      style={{
                        maxHeight: "360px",
                        overflowY: "auto",
                        padding: "1rem",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        background: "rgba(255, 255, 255, 0.03)",
                      }}
                    >
                      {report.sections && report.sections.length > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.85rem",
                          }}
                        >
                          {report.sections.map((section) => (
                            <div key={section.title}>
                              <Text
                                style={{ fontSize: "0.9rem", fontWeight: 600 }}
                              >
                                {section.title}
                              </Text>
                              <Text
                                style={{
                                  whiteSpace: "pre-wrap",
                                  fontSize: "0.82rem",
                                  color: "rgba(255, 255, 255, 0.8)",
                                  marginTop: "0.35rem",
                                }}
                              >
                                {section.body ||
                                  "No content available for this section."}
                              </Text>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <pre
                          style={{
                            whiteSpace: "pre-wrap",
                            fontSize: "0.85rem",
                            color: "rgba(255, 255, 255, 0.85)",
                            margin: 0,
                          }}
                        >
                          {report.markdown ||
                            "No report content available yet."}
                        </pre>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        variant="outline"
                        onClick={handleDownloadMarkdown}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Markdown
                      </Button>
                      <Button onClick={handleDownloadPdf} disabled={pdfLoading}>
                        <FileDown className="h-4 w-4 mr-2" />
                        {pdfLoading ? "Exporting..." : "Export as PDF"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            }
          />
        </div>
      </div>
    </PageContent>
  );
}
