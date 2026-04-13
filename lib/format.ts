import type { MoneyValue } from "@/types";

export function formatMoney(value: MoneyValue, currency = "USD") {
  const amount =
    typeof value === "string" ? Number.parseFloat(value) : Number(value ?? 0);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDateTime(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}

export function formatShortDate(value?: string | null) {
  return formatDateTime(value, {
    hour: undefined,
    minute: undefined,
  });
}

export function formatRelativeTime(value?: string | null) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 60) {
    return `${Math.max(diffSeconds, 0)}s ago`;
  }

  if (diffSeconds < 3600) {
    return `${Math.floor(diffSeconds / 60)}m ago`;
  }

  if (diffSeconds < 86400) {
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  }

  if (diffSeconds < 604800) {
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  }

  return formatShortDate(value);
}

export function secondsToMs(value?: number | null) {
  if (value == null) {
    return null;
  }

  return Math.round(value * 1000);
}

export function formatResponseTimeSeconds(value?: number | null) {
  const milliseconds = secondsToMs(value);
  if (milliseconds == null) {
    return "No data";
  }

  if (milliseconds >= 1000) {
    return `${(milliseconds / 1000).toFixed(2)}s`;
  }

  return `${milliseconds}ms`;
}

export function parseStatusCodes(value: string) {
  return value
    .split(",")
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((item) => Number.isFinite(item));
}

export function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function csvFromUnknown(value?: string | string[] | null) {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? value.join(", ") : value;
}

export function parseHeadersInput(value: string) {
  if (!value.trim()) {
    return null;
  }

  return JSON.parse(value) as Record<string, string>;
}

export function prettyPrintHeaders(value?: Record<string, string> | null) {
  if (!value || Object.keys(value).length === 0) {
    return "";
  }

  return JSON.stringify(value, null, 2);
}

export function statusTone(status?: string | null, isDown?: boolean) {
  const normalized = (status || "").toUpperCase();

  if (normalized === "DOWN" || isDown) {
    return {
      label: "Down",
      color: "#f09595",
      dot: "#e24b4a",
      background: "rgba(226,75,74,0.12)",
      border: "rgba(226,75,74,0.28)",
    };
  }

  if (normalized === "PAUSED") {
    return {
      label: "Paused",
      color: "#f0b84a",
      dot: "#ef9f27",
      background: "rgba(239,159,39,0.12)",
      border: "rgba(239,159,39,0.28)",
    };
  }

  return {
    label: "Operational",
    color: "#3dcaa0",
    dot: "#1d9e75",
    background: "rgba(29,158,117,0.12)",
    border: "rgba(29,158,117,0.28)",
  };
}
