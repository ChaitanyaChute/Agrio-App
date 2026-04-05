import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance } from "axios";
import {
    DATA_API_BASE,
    DATA_API_CONFIG_ERROR,
    ML_API_BASE,
    ML_API_CONFIG_ERROR,
} from "../config/api.config";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Attach exponential-backoff retry with rate-limit handling */
export class ApiConfigurationError extends Error {
  readonly code = "API_CONFIGURATION_ERROR";
  readonly api: "data" | "ml";

  constructor(api: "data" | "ml", message: string) {
    super(message);
    this.name = "ApiConfigurationError";
    this.api = api;
  }
}

export function isApiConfigurationError(
  error: unknown,
): error is ApiConfigurationError {
  return (
    error instanceof ApiConfigurationError ||
    (typeof error === "object" &&
      error !== null &&
      (error as { name?: string }).name === "ApiConfigurationError")
  );
}

type DataCacheEnvelope<T> = {
  data: T;
  fetchedAt: number;
};

const DATA_CACHE_PREFIX = `dataApiCacheV1:${DATA_API_BASE}`;
const DATA_CACHE_STALE_MS = 7 * 24 * 60 * 60 * 1000;

const CROPS_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const DISEASE_LIST_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const DISEASE_DETAILS_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;

const normalizeCachePart = (value: string) =>
  encodeURIComponent(value.trim().toLowerCase());

const makeDataCacheKey = (suffix: string) => `${DATA_CACHE_PREFIX}:${suffix}`;

async function readDataCache<T>(cacheKey: string): Promise<DataCacheEnvelope<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as DataCacheEnvelope<T>;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.fetchedAt !== "number" ||
      !("data" in parsed)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

async function writeDataCache<T>(cacheKey: string, data: T) {
  try {
    const payload: DataCacheEnvelope<T> = {
      data,
      fetchedAt: Date.now(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch {
    // Cache persistence errors should not block API responses.
  }
}

function revalidateInBackground<T>(cacheKey: string, fetcher: () => Promise<T>) {
  void fetcher()
    .then((fresh) => writeDataCache(cacheKey, fresh))
    .catch(() => {
      // Silent background refresh failure.
    });
}

async function cachedGet<T>(
  cacheKey: string,
  maxAgeMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await readDataCache<T>(cacheKey);
  const now = Date.now();

  if (cached) {
    const age = now - cached.fetchedAt;

    if (age <= maxAgeMs) {
      return cached.data;
    }

    if (age <= DATA_CACHE_STALE_MS) {
      revalidateInBackground(cacheKey, fetcher);
      return cached.data;
    }
  }

  try {
    const fresh = await fetcher();
    await writeDataCache(cacheKey, fresh);
    return fresh;
  } catch (error) {
    if (isApiConfigurationError(error)) {
      throw error;
    }

    if (cached) {
      return cached.data;
    }

    throw error;
  }
}

/** Attach exponential-backoff retry with rate-limit handling */
function withRetry(
  instance: AxiosInstance,
  api: "data" | "ml",
  configError: string | null,
) {
  instance.interceptors.request.use((config) => {
    if (configError) {
      return Promise.reject(new ApiConfigurationError(api, configError));
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config as typeof error.config & {
        _retryCount?: number;
      };
      if (!config) return Promise.reject(error);

      const method = config.method?.toUpperCase();
      const status = error.response?.status;

      // Retry conditions:
      // - GET requests: up to 3 retries on any error
      // - POST requests: retry on rate limit (429), server errors (5xx), and network errors
      // - Don't retry 4xx errors (except 429)
      const isRetryableMethod =
        method === "GET" ||
        (method === "POST" &&
          (status === 429 || status === 503 || status === 504 || !status));

      if (!isRetryableMethod) return Promise.reject(error);

      config._retryCount = (config._retryCount ?? 0) + 1;

      // Max retries: 3 for normal errors, 5 for rate limits (429)
      const maxRetries = status === 429 ? 5 : 3;
      if (config._retryCount > maxRetries) return Promise.reject(error);

      // Exponential backoff with jitter
      // Rate limit (429): 2s, 4s, 8s, 16s, 32s
      // Other errors: 1s, 2s, 4s
      const baseDelay = status === 429 ? 2000 : 1000;
      const delay = baseDelay * Math.pow(2, config._retryCount - 1);
      const jitter = Math.random() * 1000; // Add 0-1s random jitter

      await new Promise((res) => setTimeout(res, delay + jitter));
      return instance(config);
    },
  );
  return instance;
}

/**
 * Node.js data backend (port 5000).
 * Used for all crop / disease info endpoints.
 */
const dataApi = withRetry(
  axios.create({ baseURL: DATA_API_BASE, timeout: 30000 }),
  "data",
  DATA_API_CONFIG_ERROR,
);

/**
 * FastAPI ML backend (port 8000).
 * Used only for POST /predict.
 */
const mlApi = withRetry(
  axios.create({ baseURL: ML_API_BASE, timeout: 60000 }),
  "ml",
  ML_API_CONFIG_ERROR,
);

// ── Types ─────────────────────────────────────────────────────────────────────

/** GET /api/crops */
export interface Crop {
  crop_id: string;
  crop_name: string;
}

/** GET /api/:crop_name/disease */
export interface CropDiseasesResponse {
  crop: string;
  diseases: string[];
}

/** GET /api/:crop_name/disease/:disease_name/description */
export interface DescriptionResponse {
  about_disease: string;
  symptoms: string[];
  cause: string;
  severity: string; // "Low" | "Moderate" | "High"
}

/** GET /api/:crop_name/disease/:disease_name/cure */
export interface CureResponse {
  chemical: string[];
  organic: string[];
  dosage: string;
  interval: string;
}

/** GET /api/:crop_name/disease/:disease_name/nature */
export interface NatureResponse {
  disease: string;
  nature_of_disease: string;
}

/** GET /api/:crop_name/disease/:disease_name/severity */
export interface SeverityResponse {
  disease: string;
  severity: string;
  description?: string;
}

/** POST /predict */
export interface SeverityInfo {
  percentage: number;
  label: string;
  range: string;
  source: string;
}

export interface TreatmentInfo {
  chemical: string[];
  organic: string[];
  dosage: string;
  interval: string;
}

export interface PredictResult {
  crop: string;
  disease: string;
  confidence: number;
  severity: SeverityInfo;
  treatment: TreatmentInfo;
}

// ── Data-backend functions (port 5000) ────────────────────────────────────────

/** GET /api/crops — returns all available crops */
export async function getCrops(): Promise<Crop[]> {
  return cachedGet<Crop[]>(
    makeDataCacheKey("crops"),
    CROPS_CACHE_MAX_AGE_MS,
    async () => {
      const response = await dataApi.get<Crop[]>("/api/crops");
      return response.data;
    },
  );
}

/** GET /api/:crop_name/disease — returns all diseases for a crop */
export async function getDiseases(
  cropName: string,
): Promise<CropDiseasesResponse> {
  const cacheKey = makeDataCacheKey(
    `diseases:${normalizeCachePart(cropName)}`,
  );

  return cachedGet<CropDiseasesResponse>(
    cacheKey,
    DISEASE_LIST_CACHE_MAX_AGE_MS,
    async () => {
      const response = await dataApi.get<CropDiseasesResponse>(
        `/api/${encodeURIComponent(cropName)}/disease`,
      );
      return response.data;
    },
  );
}

/** GET /api/:crop_name/disease/:disease_name — returns a specific disease */
export async function getDisease(
  cropName: string,
  diseaseName: string,
): Promise<{ crop: string; disease: string }> {
  const cacheKey = makeDataCacheKey(
    `disease:${normalizeCachePart(cropName)}:${normalizeCachePart(diseaseName)}`,
  );

  return cachedGet<{ crop: string; disease: string }>(
    cacheKey,
    DISEASE_DETAILS_CACHE_MAX_AGE_MS,
    async () => {
      const response = await dataApi.get<{ crop: string; disease: string }>(
        `/api/${encodeURIComponent(cropName)}/disease/${encodeURIComponent(diseaseName)}`,
      );
      return response.data;
    },
  );
}

/** GET /api/:crop_name/disease/:disease_name/description — description, symptoms, cause, default severity */
export async function getDescription(
  cropName: string,
  diseaseName: string,
): Promise<DescriptionResponse> {
  const cacheKey = makeDataCacheKey(
    `description:${normalizeCachePart(cropName)}:${normalizeCachePart(diseaseName)}`,
  );

  return cachedGet<DescriptionResponse>(
    cacheKey,
    DISEASE_DETAILS_CACHE_MAX_AGE_MS,
    async () => {
      const response = await dataApi.get<DescriptionResponse>(
        `/api/${encodeURIComponent(cropName)}/disease/${encodeURIComponent(diseaseName)}/description`,
      );
      return response.data;
    },
  );
}

/** GET /api/:crop_name/disease/:disease_name/cure — chemical & organic cure info */
export async function getTreatment(
  cropName: string,
  diseaseName: string,
): Promise<CureResponse> {
  const cacheKey = makeDataCacheKey(
    `cure:${normalizeCachePart(cropName)}:${normalizeCachePart(diseaseName)}`,
  );

  return cachedGet<CureResponse>(
    cacheKey,
    DISEASE_DETAILS_CACHE_MAX_AGE_MS,
    async () => {
      const response = await dataApi.get<CureResponse>(
        `/api/${encodeURIComponent(cropName)}/disease/${encodeURIComponent(diseaseName)}/cure`,
      );
      return response.data;
    },
  );
}

/** GET /api/:crop_name/disease/:disease_name/nature — nature/type of the disease */
export async function getNature(
  cropName: string,
  diseaseName: string,
): Promise<NatureResponse> {
  const cacheKey = makeDataCacheKey(
    `nature:${normalizeCachePart(cropName)}:${normalizeCachePart(diseaseName)}`,
  );

  return cachedGet<NatureResponse>(
    cacheKey,
    DISEASE_DETAILS_CACHE_MAX_AGE_MS,
    async () => {
      const response = await dataApi.get<NatureResponse>(
        `/api/${encodeURIComponent(cropName)}/disease/${encodeURIComponent(diseaseName)}/nature`,
      );
      return response.data;
    },
  );
}

/** GET /api/:crop_name/disease/:disease_name/severity — severity information */
export async function getSeverity(
  cropName: string,
  diseaseName: string,
): Promise<SeverityResponse> {
  const cacheKey = makeDataCacheKey(
    `severity:${normalizeCachePart(cropName)}:${normalizeCachePart(diseaseName)}`,
  );

  return cachedGet<SeverityResponse>(
    cacheKey,
    DISEASE_DETAILS_CACHE_MAX_AGE_MS,
    async () => {
      const response = await dataApi.get<SeverityResponse>(
        `/api/${encodeURIComponent(cropName)}/disease/${encodeURIComponent(diseaseName)}/severity`,
      );
      return response.data;
    },
  );
}

/**
 * Warm key catalog endpoints to reduce perceived loading time across screens.
 */
export async function preloadReferenceData() {
  try {
    const crops = await getCrops();
    const topCropNames = crops.slice(0, 6).map((crop) => crop.crop_name);
    await Promise.allSettled(topCropNames.map((cropName) => getDiseases(cropName)));
  } catch {
    // Best-effort preload only.
  }
}

// ── ML-backend function (port 8000) ───────────────────────────────────────────

interface RawPredictResponse {
  disease: string;
  crop: string;
  confidence: string; // e.g., "98.5%"
  severity: string; // e.g., "Moderate"
  infected_area_pct: number;
  severity_method: string;
  chemical_cure?: string[] | null;
  organic_cure?: string[] | null;
  description: string;
  symptoms: string[];
  cause: string[];
}

function normalizeTextList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function isNotLeaf422(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (error.response?.status !== 422) return false;

  const detail = (error.response.data as any)?.detail;
  return detail?.error === "not_a_leaf";
}

/** POST /predict — multipart image upload to FastAPI ML model */
export async function predictDisease(imageUri: string): Promise<PredictResult> {
  const fileName = imageUri.split("/").pop() ?? "photo.jpg";
  const mimeType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";

  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  try {
    const response = await mlApi.post<RawPredictResponse>(
      "/predict",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    const raw = response.data;

    // Convert "98.5%" to 0.985
    let confidenceFloat = 0;
    if (typeof raw.confidence === "string") {
      confidenceFloat = parseFloat(raw.confidence.replace("%", "")) / 100;
    } else if (typeof raw.confidence === "number") {
      confidenceFloat = raw.confidence;
    }

    const modelChemical = normalizeTextList(raw.chemical_cure);
    const modelOrganic = normalizeTextList(raw.organic_cure);

    let chemical = modelChemical;
    let organic = modelOrganic;
    let dosage = "As per instructions (approx 2g/L)";
    let interval = "Every 7-10 days";

    // If model response has no treatment recommendations, fetch cure data
    // from the data backend using the predicted crop + disease.
    if (chemical.length === 0 || organic.length === 0) {
      try {
        const cure = await getTreatment(raw.crop, raw.disease);
        const cureChemical = normalizeTextList(cure.chemical);
        const cureOrganic = normalizeTextList(cure.organic);

        if (chemical.length === 0) chemical = cureChemical;
        if (organic.length === 0) organic = cureOrganic;
        if (typeof cure.dosage === "string" && cure.dosage.trim()) {
          dosage = cure.dosage.trim();
        }
        if (typeof cure.interval === "string" && cure.interval.trim()) {
          interval = cure.interval.trim();
        }
      } catch {
        // Keep model/default treatment values if cure lookup fails.
      }
    }

    return {
      crop: raw.crop,
      disease: raw.disease,
      confidence: confidenceFloat,
      severity: {
        percentage: raw.infected_area_pct ?? 0,
        label: raw.severity ?? "Unknown",
        range: raw.severity ?? "Unknown",
        source: raw.severity_method ?? "AI",
      },
      treatment: {
        chemical,
        organic,
        dosage,
        interval,
      },
    };
  } catch (error: any) {
    // Expected model validation case: image is not a leaf.
    // Let UI handle this gracefully without noisy red-box logs.
    if (isNotLeaf422(error)) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      console.error("\n=== AXIOS UPLOAD ERROR ===");
      console.error("Message:", error.message);
      console.error("Code:", error.code);
      console.error("URL:", error.config?.url);
      console.error("BaseURL:", error.config?.baseURL);

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", JSON.stringify(error.response.data, null, 2));

        if (error.response.status === 429) {
          console.error(
            "⚠️  Rate limited (429). Retries will be attempted with exponential backoff.",
          );
        } else if (error.response.status >= 500) {
          console.error(
            "⚠️  Server error. The backend may be temporarily down or unresponsive.",
          );
        }
      } else if (error.request) {
        console.error("❌ No response received. Possible causes:");
        console.error(
          "   - Server is down or not running at " + error.config?.baseURL,
        );
        console.error("   - IP address is incorrect");
        console.error("   - Network/firewall blocking the connection");
        console.error("   - CORS issue (if on web)");
      }
      console.error("==========================\n");
    } else {
      console.error("Unknown error predicting disease:", error);
    }
    throw error;
  }
}
