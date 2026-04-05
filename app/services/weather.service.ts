import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance } from "axios";
import * as Location from "expo-location";
import {
    WEATHER_API_BASE,
    WEATHER_API_CONFIG_ERROR,
    WEATHER_API_KEY,
} from "../config/api.config";

const WEATHER_CACHE_KEY = "weatherCacheV1";
const WEATHER_TIMEOUT_MS = 15000;
const WEATHER_FRESH_MS = 10 * 60 * 1000;

export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  location: string;
}

interface CachedWeather {
  data: WeatherData;
  fetchedAt: number;
}

export interface WeatherFetchResult {
  data: WeatherData;
  fetchedAt: number;
  fromCache: boolean;
  stale: boolean;
}

export class WeatherConfigurationError extends Error {
  readonly code = "WEATHER_CONFIGURATION_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "WeatherConfigurationError";
  }
}

export class WeatherFetchError extends Error {
  readonly code = "WEATHER_FETCH_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "WeatherFetchError";
  }
}

export function isWeatherConfigurationError(
  error: unknown,
): error is WeatherConfigurationError {
  return (
    error instanceof WeatherConfigurationError ||
    (typeof error === "object" &&
      error !== null &&
      (error as { name?: string }).name === "WeatherConfigurationError")
  );
}

function withRetry(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config as typeof error.config & {
        _retryCount?: number;
      };
      if (!config) return Promise.reject(error);

      const status = error.response?.status;
      const retryable =
        status === 429 || status === 503 || status === 504 || !status;
      if (!retryable) return Promise.reject(error);

      config._retryCount = (config._retryCount ?? 0) + 1;
      if (config._retryCount > 3) return Promise.reject(error);

      const baseDelay = status === 429 ? 2000 : 800;
      const delay = baseDelay * Math.pow(2, config._retryCount - 1);
      const jitter = Math.random() * 500;

      await new Promise((res) => setTimeout(res, delay + jitter));
      return instance(config);
    },
  );

  return instance;
}

const weatherApi = withRetry(
  axios.create({
    baseURL: WEATHER_API_BASE,
    timeout: WEATHER_TIMEOUT_MS,
  }),
);

function toLanguageCode(language: string) {
  return language === "hi" ? "hi" : "en";
}

function toWeatherData(raw: any): WeatherData {
  return {
    temp: Math.round(raw?.main?.temp ?? 0),
    feelsLike: Math.round(raw?.main?.feels_like ?? 0),
    condition: String(raw?.weather?.[0]?.main ?? "Unknown"),
    description: String(raw?.weather?.[0]?.description ?? ""),
    humidity: Number(raw?.main?.humidity ?? 0),
    windSpeed: Math.round(Number(raw?.wind?.speed ?? 0) * 3.6),
    icon: String(raw?.weather?.[0]?.icon ?? ""),
    location: String(raw?.name ?? "Unknown"),
  };
}

function mapAxiosError(error: unknown): WeatherFetchError {
  if (!axios.isAxiosError(error)) {
    return new WeatherFetchError("Unable to fetch weather right now.");
  }

  const status = error.response?.status;
  if (status === 401 || status === 403) {
    return new WeatherFetchError(
      "Weather API key is invalid. Please update EXPO_PUBLIC_OPENWEATHER_API_KEY.",
    );
  }
  if (status === 429) {
    return new WeatherFetchError(
      "Weather service rate limit reached. Please try again in a moment.",
    );
  }
  if (status && status >= 500) {
    return new WeatherFetchError(
      "Weather service is temporarily unavailable. Please try again.",
    );
  }

  return new WeatherFetchError(
    "Unable to fetch weather data. Check your internet connection.",
  );
}

async function readCachedWeather(): Promise<CachedWeather | null> {
  try {
    const raw = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedWeather;
    if (!parsed?.data || typeof parsed?.fetchedAt !== "number") return null;

    return parsed;
  } catch {
    return null;
  }
}

async function writeCachedWeather(data: WeatherData, fetchedAt: number) {
  try {
    const payload: CachedWeather = { data, fetchedAt };
    await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Cache write failures should never break weather rendering.
  }
}

async function getCurrentCoords() {
  const lastKnown = await Location.getLastKnownPositionAsync({});

  try {
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 1000,
    });
    return current.coords;
  } catch {
    if (lastKnown?.coords) return lastKnown.coords;
    throw new WeatherFetchError(
      "Location is unavailable. Please try again where GPS is stronger.",
    );
  }
}

export async function fetchWeatherForCurrentLocation(
  language: string,
  forceRefresh = false,
): Promise<WeatherFetchResult> {
  if (WEATHER_API_CONFIG_ERROR) {
    throw new WeatherConfigurationError(WEATHER_API_CONFIG_ERROR);
  }

  const cached = await readCachedWeather();
  const now = Date.now();

  if (!forceRefresh && cached && now - cached.fetchedAt <= WEATHER_FRESH_MS) {
    return {
      data: cached.data,
      fetchedAt: cached.fetchedAt,
      fromCache: true,
      stale: false,
    };
  }

  try {
    const coords = await getCurrentCoords();

    const response = await weatherApi.get("/weather", {
      params: {
        lat: coords.latitude,
        lon: coords.longitude,
        units: "metric",
        lang: toLanguageCode(language),
        appid: WEATHER_API_KEY,
      },
    });

    const data = toWeatherData(response.data);
    await writeCachedWeather(data, now);

    return {
      data,
      fetchedAt: now,
      fromCache: false,
      stale: false,
    };
  } catch (error) {
    if (cached) {
      return {
        data: cached.data,
        fetchedAt: cached.fetchedAt,
        fromCache: true,
        stale: true,
      };
    }

    if (error instanceof WeatherFetchError) {
      throw error;
    }

    throw mapAxiosError(error);
  }
}
