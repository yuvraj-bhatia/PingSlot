const API_BASE = "/api/ai-engine";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const errorBody = await response.json().catch(() => ({}));
      const message =
        (errorBody.detail as string) ||
        (errorBody.error as string) ||
        response.statusText ||
        "Request failed";
      throw new Error(message);
    }

    const text = await response.text().catch(() => "");
    throw new Error(text || response.statusText || "Request failed");
  }

  return response.json() as Promise<T>;
}

export interface DatasetUploadResponse {
  dataset_id: string;
  name: string;
  file_path: string;
  schema: {
    columns: string[];
    dtypes: Record<string, string>;
    numeric_columns: string[];
  };
  row_count: number;
  column_count: number;
}

export interface DatasetSummary {
  dataset_id: string;
  name: string;
  n_rows: number;
  n_columns: number;
  created_at?: string | null;
  uploaded_by?: string | null;
}

export interface DatasetPreviewResponse {
  dataset_id: string;
  head: Record<string, unknown>[];
  tail: Record<string, unknown>[];
}

export interface DatasetFieldsResponse {
  dataset_id: string;
  fields: Array<{
    name: string;
    type: string;
    is_numeric: boolean;
  }>;
}

export interface TrainOLSResponse {
  model_id: string;
  status: string;
  model_family: string;
  metrics: {
    r2: number;
    mae: number;
    mse: number;
    rmse: number;
    rsquared: number;
    rsquared_adj: number;
    f_pvalue: number;
    aic: number;
    bic: number;
  };
  coefficients: Record<string, number>;
  pvalues: Record<string, number>;
  feature_columns: string[];
  target_column: string;
  correlations: Record<string, number>;
  strong_predictors: string[];
  total_possible_models: number;
  total_models_evaluated: number;
  top_models: Array<{
    predictors: string[];
    k: number;
    adj_r2: number;
    aic: number;
    f_pvalue: number;
    max_pvalue: number;
    all_significant: boolean;
  }>;
  candidate_features?: string[];
  dropped_features?: string[];
  reasoning?: string[];
}

export interface ModelSummary {
  model_id: string;
  name: string;
  model_family: string;
  problem_type: string;
  status: string;
  target_column: string;
  feature_columns: string[];
  metrics: Record<string, number | string | null>;
  created_at?: string | null;
  updated_at?: string | null;
  user_id?: string | null;
}

export interface ModelDetails extends ModelSummary {
  dataset_id?: string | null;
  hyperparams?: Record<string, unknown>;
  cv_summary?: Record<string, unknown>;
  artifact_path?: string | null;
  coefficients?: Record<string, number>;
  pvalues?: Record<string, number>;
  correlations?: Record<string, number>;
  top_models?: TrainOLSResponse["top_models"];
}

export interface PredictionResponse {
  prediction: number;
  ci_low?: number | null;
  ci_high?: number | null;
  model_id: string;
  model_family: string;
  target_column: string;
  latency_ms: number;
  input_features: Record<string, number>;
  prediction_id?: string | null;
}

export interface PredictionLog {
  id: string;
  model_id: string;
  model_name?: string;
  dataset_id?: string | null;
  dataset_name?: string;
  created_at: string;
  target_column: string;
  input_features?: Record<string, number>;
  prediction: number;
  ci_low?: number | null;
  ci_high?: number | null;
  latency_ms?: number;
}

export async function uploadDataset(
  file: File,
  options: { name?: string; userId?: string } = {},
): Promise<DatasetUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (options.name) {
    formData.append("name", options.name);
  }

  // 🔁 Go through Next.js proxy instead of hitting FastAPI directly
  const response = await fetch("/api/ai-engine/datasets", {
    method: "POST",
    body: formData,
  });

  return handleResponse<DatasetUploadResponse>(response);
}

export type SampleDatasetId = "mda3-sales" | "statcan-business-dynamics";

export async function loadSampleDataset(
  sampleId: SampleDatasetId,
): Promise<DatasetUploadResponse> {
  const response = await fetch(`${API_BASE}/datasets/sample`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sample_id: sampleId }),
  });

  return handleResponse<DatasetUploadResponse>(response);
}

export async function listDatasets(): Promise<DatasetSummary[]> {
  const response = await fetch("/api/ai-engine/datasets");
  return handleResponse<DatasetSummary[]>(response);
}

export async function fetchDatasetPreview(
  datasetId: string,
  rows = 8,
): Promise<DatasetPreviewResponse> {
  const response = await fetch(
    `/api/ai-engine/datasets/${datasetId}/preview?rows=${rows}`,
  );
  return handleResponse<DatasetPreviewResponse>(response);
}

export async function fetchDatasetFields(
  datasetId: string,
): Promise<DatasetFieldsResponse> {
  const response = await fetch(`/api/ai-engine/datasets/${datasetId}/fields`);
  return handleResponse<DatasetFieldsResponse>(response);
}

export async function trainOLSModel({
  datasetId,
  targetColumn,
  featureColumns,
  userId: _userId,
  testSize,
  pValueThreshold,
  maxFeatures,
}: {
  datasetId: string;
  targetColumn: string;
  featureColumns: string[];
  userId?: string;
  testSize?: number;
  pValueThreshold?: number;
  maxFeatures?: number;
}): Promise<TrainOLSResponse> {
  void _userId;
  const hyperparameters: Record<string, number> = {};
  if (typeof testSize === "number") {
    hyperparameters.test_size = testSize;
  }
  if (typeof pValueThreshold === "number") {
    hyperparameters.p_value_threshold = pValueThreshold;
  }
  if (typeof maxFeatures === "number") {
    hyperparameters.max_features = maxFeatures;
  }

  const response = await fetch(`${API_BASE}/models`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dataset_id: datasetId,
      model_type: "ols",
      target_column: targetColumn,
      feature_list: featureColumns,
      hyperparameters,
    }),
  });

  return handleResponse<TrainOLSResponse>(response);
}

export interface AutoMLTrainingResult {
  model_id: string;
  status?: string;
  best_algorithm?: string;
  best_model?: string;
  best_model_score?: number;
  model_family?: string;
  metrics?: {
    r2?: number;
    rmse?: number;
    mae?: number;
    cv_mean?: number;
    cv_std?: number;
  };
  selected_features?: string[];
  total_features?: number;
  normalization?: string;
  feature_selection?: string;
  model_performances?: Array<{
    model_name: string;
    cv_mean_score: number;
    cv_std_score: number;
    test_r2: number;
    test_rmse: number;
    test_mae: number;
    rank: number;
  }>;
}

export type TrainAutoMLResponse = AutoMLTrainingResult;

export interface AutoMLConfig {
  datasetId: string;
  targetColumn: string;
  featureList: string[];
  testSize?: number;
  cvFolds?: number;
  normalizationMethod?: "none" | "standard" | "minmax";
}

export async function trainAutoMLModel({
  datasetId,
  targetColumn,
  featureList,
  testSize,
  cvFolds,
  normalizationMethod,
}: AutoMLConfig): Promise<AutoMLTrainingResult> {
  const hyperparameters: Record<string, number | string> = {};
  if (typeof testSize === "number") {
    hyperparameters.test_size = testSize;
  }
  if (typeof cvFolds === "number") {
    hyperparameters.cv_folds = cvFolds;
  }
  if (normalizationMethod) {
    hyperparameters.normalization_method = normalizationMethod;
  }

  const response = await fetch(`${API_BASE}/models`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dataset_id: datasetId,
      model_type: "automl",
      target_column: targetColumn,
      feature_list: featureList,
      hyperparameters,
    }),
  });

  return handleResponse<AutoMLTrainingResult>(response);
}

export async function listModels(): Promise<ModelSummary[]> {
  const response = await fetch(`${API_BASE}/models`);
  return handleResponse<ModelSummary[]>(response);
}

export async function getModelDetails(modelId: string): Promise<ModelDetails> {
  const response = await fetch(`${API_BASE}/models/${modelId}`);
  return handleResponse<ModelDetails>(response);
}

export async function makePrediction({
  modelId,
  inputFeatures,
  userId: _userId,
}: {
  modelId: string;
  inputFeatures: Record<string, number>;
  userId?: string;
}): Promise<PredictionResponse> {
  void _userId;
  const response = await fetch(`${API_BASE}/predictions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model_id: modelId,
      input_features: inputFeatures,
    }),
  });

  return handleResponse<PredictionResponse>(response);
}

export async function listPredictions(params?: {
  modelId?: string;
  datasetId?: string;
  limit?: number;
  startDate?: string;
  endDate?: string;
}): Promise<PredictionLog[]> {
  const query = new URLSearchParams();
  if (params?.modelId) {
    query.set("model_id", params.modelId);
  }
  if (params?.datasetId) {
    query.set("dataset_id", params.datasetId);
  }
  if (typeof params?.limit === "number") {
    query.set("limit", String(params.limit));
  }
  if (params?.startDate) {
    query.set("start_date", params.startDate);
  }
  if (params?.endDate) {
    query.set("end_date", params.endDate);
  }

  const queryString = query.toString();
  // TODO(api): expects ML GET /api/predictions to return prediction logs.
  const response = await fetch(
    `/api/ai-engine/predictions${queryString ? `?${queryString}` : ""}`,
  );
  return handleResponse<PredictionLog[]>(response);
}

export interface ReliabilityBreakdownItem {
  status:
    | "good"
    | "minor"
    | "warning"
    | "critical"
    | "error"
    | "not_available"
    | "not_applicable"
    | "moderate";
  detail: string;
  penalty?: number;
  value?: number;
  threshold?: number;
  [key: string]: unknown;
}

export interface ReliabilityScore {
  score: number;
  label: "High" | "Medium" | "Low" | "Critical" | "Error";
  issues: string[];
  breakdown?: Record<string, ReliabilityBreakdownItem>;
  model_family?: string;
  last_updated?: string | null;
}

export async function getDatasetReliability(
  datasetId: string,
): Promise<ReliabilityScore> {
  const response = await fetch(`${API_BASE}/datasets/${datasetId}/reliability`);
  return handleResponse<ReliabilityScore>(response);
}

export async function getModelReliability(
  modelId: string,
): Promise<ReliabilityScore> {
  const response = await fetch(`${API_BASE}/models/${modelId}/reliability`);
  return handleResponse<ReliabilityScore>(response);
}

// 👇 tweak these types to match whatever Task 3 actually expects/returns
export interface Task3Request {
  // example fields – change to your real ones
  customer_size: number;
  industry: string;
  region?: string;
}

export interface Task3Response {
  // can be `any` if you don't care about typing
  result: unknown;
  // add more fields if you know them
}

/**
 * Calls the Task 3 ML endpoint.
 */
export async function runTask3(payload: Task3Request): Promise<Task3Response> {
  const res = await fetch(`${API_BASE}/task3`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Task3Response>(res);
}

export interface StakeholderReportRequest {
  datasetId: string;
  modelId: string;
  audience?: "ops" | "leadership" | "technical";
}

export interface ReportSection {
  title: string;
  body: string;
}

export interface ReportMetadata {
  generated_at: string;
  model?: {
    id?: string;
    name?: string;
    model_family?: string;
    target_column?: string;
    status?: string;
  } | null;
  dataset?: {
    id?: string;
    name?: string;
    n_rows?: number;
    n_columns?: number;
  } | null;
  audience?: string | null;
}

export interface ReportPreviewResponse {
  report_id?: string;
  status?: string;
  report_title: string;
  metadata: ReportMetadata;
  sections: ReportSection[];
  summary_metrics?: Record<string, unknown>;
  markdown?: string;
}

export async function previewReport(
  payload: StakeholderReportRequest,
): Promise<ReportPreviewResponse> {
  const response = await fetch(`${API_BASE}/reports/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dataset_id: payload.datasetId,
      model_id: payload.modelId,
      audience: payload.audience,
    }),
  });

  return handleResponse<ReportPreviewResponse>(response);
}

export async function createReport(
  payload: StakeholderReportRequest,
): Promise<ReportPreviewResponse> {
  const response = await fetch(`${API_BASE}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dataset_id: payload.datasetId,
      model_id: payload.modelId,
      audience: payload.audience,
    }),
  });

  return handleResponse<ReportPreviewResponse>(response);
}

export async function getReport(
  reportId: string,
): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE}/reports/${reportId}`, {
    method: "GET",
  });

  return handleResponse<Record<string, unknown>>(response);
}

export async function downloadReportPdf(reportId: string): Promise<Blob> {
  const response = await fetch(
    `${API_BASE}/reports/${reportId}/download?format=pdf`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const errorBody = await response.json().catch(() => ({}));
      const message =
        (errorBody.error as string) ||
        (errorBody.detail as string) ||
        response.statusText ||
        "PDF export failed";
      throw new Error(message);
    }

    const text = await response.text().catch(() => "");
    throw new Error(text || response.statusText || "PDF export failed");
  }

  return response.blob();
}
