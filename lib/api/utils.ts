import axios from "axios";
import type { MonitorPayload } from "@/types";

export function extractApiError(error: unknown, fallback = "Something went wrong") {
  if (error && typeof error === "object" && !axios.isAxiosError(error)) {
    const data = error as { detail?: unknown; details?: unknown; error?: unknown; message?: unknown };
    const candidate = data.detail ?? data.details ?? data.error ?? data.message;

    if (typeof candidate === "string") {
      return candidate;
    }

    if (Array.isArray(candidate)) {
      return candidate.map((item) => String(item)).join(", ");
    }
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { detail?: unknown; details?: unknown; error?: unknown }
      | undefined;

    const candidate = data?.detail ?? data?.details ?? data?.error;

    if (Array.isArray(candidate)) {
      return candidate
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item && typeof item === "object") {
            const entry = item as Record<string, unknown>;
            return String(entry.msg ?? entry.message ?? JSON.stringify(entry));
          }

          return String(item);
        })
        .join(", ");
    }

    if (candidate && typeof candidate === "object") {
      return Object.values(candidate as Record<string, unknown>)
        .map((value) => String(value))
        .join(", ");
    }

    if (typeof candidate === "string") {
      return candidate;
    }

    if (typeof error.message === "string" && error.message.length > 0) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function normalizeMonitorPayload(payload: Partial<MonitorPayload>) {
  const nextPayload = { ...payload } as Record<string, unknown>;

  if (Array.isArray(payload.expected_status_codes)) {
    nextPayload.expected_status_codes = payload.expected_status_codes.join(",");
  }

  if (Array.isArray(payload.tags)) {
    nextPayload.tags = payload.tags.join(",");
  }

  if (payload.headers && typeof payload.headers === "object") {
    const cleanedHeaders = Object.fromEntries(
      Object.entries(payload.headers)
        .map(([key, value]) => [key.trim(), value?.trim?.() ?? value])
        .filter(([key, value]) => Boolean(key) && Boolean(value))
    );

    nextPayload.headers = Object.keys(cleanedHeaders).length > 0 ? cleanedHeaders : null;
  }

  if (typeof payload.notification_channels === "string") {
    nextPayload.notification_channels = payload.notification_channels
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .join(",");
  }

  return nextPayload;
}
