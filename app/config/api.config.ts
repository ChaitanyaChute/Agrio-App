import { Platform } from "react-native";

const sanitizeUrl = (url?: string) =>
  url?.replace(/\s+/g, "").replace(/\/+$/, "");

const normalizeMlBase = (url?: string) =>
  sanitizeUrl(url)?.replace(/\/predict$/i, "");

const isLocalHostLikeUrl = (url?: string) => {
  if (!url) return false;
  return /(^|\/\/)(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/|$)/i.test(url);
};

const devDataFallback =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://127.0.0.1:5000";
const devMlFallback =
  Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://127.0.0.1:8000";

/**
 * Node.js data backend (port 5000).
 * Serves: /api/crops, /api/:crop/disease, /api/:crop/disease/:disease/...
 * Override via EXPO_PUBLIC_DATA_API_BASE in your .env file.
 */
export const DATA_API_BASE =
  sanitizeUrl(process.env.EXPO_PUBLIC_DATA_API_BASE) ??
  (__DEV__ ? devDataFallback : "");

/**
 * FastAPI ML backend (port 8000).
 * Serves: POST /predict
 * Override via EXPO_PUBLIC_ML_API_BASE in your .env file.
 * Accepts either:
 * - https://host.tld
 * - https://host.tld/predict
 */
export const ML_API_BASE =
  normalizeMlBase(process.env.EXPO_PUBLIC_ML_API_BASE) ??
  (__DEV__ ? devMlFallback : "");

const releaseConfigError = (
  baseUrl: string,
  envName: "EXPO_PUBLIC_DATA_API_BASE" | "EXPO_PUBLIC_ML_API_BASE",
  portHint: number,
) => {
  if (__DEV__) return null;

  if (!baseUrl) {
    return `Missing ${envName} in release build. Set ${envName} to a reachable backend URL before building APK.`;
  }

  if (isLocalHostLikeUrl(baseUrl)) {
    return `${envName} is set to localhost (${baseUrl}). Localhost is not reachable inside release APK. Use a public URL or your machine LAN IP (for example, http://192.168.x.x:${portHint}).`;
  }

  return null;
};

export const DATA_API_CONFIG_ERROR = releaseConfigError(
  DATA_API_BASE,
  "EXPO_PUBLIC_DATA_API_BASE",
  5000,
);

export const ML_API_CONFIG_ERROR = releaseConfigError(
  ML_API_BASE,
  "EXPO_PUBLIC_ML_API_BASE",
  8000,
);

/**
 * OpenWeather backend.
 * Uses the public weather endpoint with an API key provided via env.
 */
export const WEATHER_API_BASE = "https://api.openweathermap.org/data/2.5";

const weatherApiKey =
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ??
  process.env.OPENWEATHER_API_KEY;

export const WEATHER_API_KEY = weatherApiKey?.trim() ?? "";

export const WEATHER_API_CONFIG_ERROR =
  !__DEV__ && !WEATHER_API_KEY
    ? "Missing EXPO_PUBLIC_OPENWEATHER_API_KEY in release build. Set EXPO_PUBLIC_OPENWEATHER_API_KEY before building APK."
    : null;
