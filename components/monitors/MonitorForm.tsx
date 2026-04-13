"use client";

import { useState } from "react";
import type { Monitor, MonitorPayload } from "@/types";
import { csvFromUnknown, parseCommaList, parseHeadersInput, parseStatusCodes, prettyPrintHeaders } from "@/lib/format";
import { Notice } from "@/components/dashboard/ui";

type MonitorFormValues = Partial<MonitorPayload> & Partial<Monitor>;

export function MonitorForm({
  mode,
  initialValues,
  onSubmit,
  submitLabel,
}: {
  mode: "create" | "edit";
  initialValues?: MonitorFormValues;
  onSubmit: (payload: MonitorPayload) => Promise<void>;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [url, setUrl] = useState(initialValues?.url ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [method, setMethod] = useState(initialValues?.method ?? "GET");
  const [checkInterval, setCheckInterval] = useState(String(initialValues?.check_interval ?? 60));
  const [timeout, setTimeoutValue] = useState(String(initialValues?.timeout ?? 10));
  const [retryCount, setRetryCount] = useState(String(initialValues?.retry_count ?? 0));
  const [alertThreshold, setAlertThreshold] = useState(
    String(initialValues?.alert_threshold ?? 5)
  );
  const [expectedStatusCodes, setExpectedStatusCodes] = useState(
    initialValues?.expected_status_codes
      ? String(initialValues.expected_status_codes)
      : "200,201"
  );
  const [headersText, setHeadersText] = useState(
    prettyPrintHeaders((initialValues as { headers?: Record<string, string> | null })?.headers)
  );
  const [body, setBody] = useState((initialValues as { body?: string | null })?.body ?? "");
  const [notificationChannels, setNotificationChannels] = useState(
    csvFromUnknown((initialValues as { notification_channels?: string | string[] | null })?.notification_channels) ||
      "email"
  );
  const [webhookUrl, setWebhookUrl] = useState(
    (initialValues as { webhook_url?: string | null })?.webhook_url ?? ""
  );
  const [tags, setTags] = useState(csvFromUnknown(initialValues?.tags));
  const [isPaused, setIsPaused] = useState(Boolean(initialValues?.is_paused));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!name.trim() || !url.trim()) {
        throw new Error("Name and endpoint URL are required.");
      }

      const parsedUrl = new URL(url);
      const interval = Number.parseInt(checkInterval, 10);
      const timeoutNumber = Number.parseFloat(timeout);
      const retries = Number.parseInt(retryCount, 10);
      const threshold = Number.parseInt(alertThreshold, 10);
      const statusCodes = parseStatusCodes(expectedStatusCodes);
      const headers = headersText.trim() ? parseHeadersInput(headersText) : null;

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Only HTTP and HTTPS endpoints are supported.");
      }

      if (!Number.isFinite(interval) || interval < 30) {
        throw new Error("Check interval must be at least 30 seconds.");
      }

      if (!Number.isFinite(timeoutNumber) || timeoutNumber <= 0) {
        throw new Error("Timeout must be greater than 0 seconds.");
      }

      if (!Number.isFinite(retries) || retries < 0) {
        throw new Error("Retry count cannot be negative.");
      }

      if (!Number.isFinite(threshold) || threshold < 1) {
        throw new Error("Alert threshold must be at least 1.");
      }

      if (statusCodes.length === 0) {
        throw new Error("Enter at least one expected status code.");
      }

      const payload: MonitorPayload = {
        name: name.trim(),
        url: parsedUrl.toString(),
        description: description.trim() || null,
        method,
        check_interval: interval,
        timeout: timeoutNumber,
        retry_count: retries,
        alert_threshold: threshold,
        expected_status_codes: statusCodes,
        headers,
        body: body.trim() || null,
        notification_channels: parseCommaList(notificationChannels).join(",") || "email",
        webhook_url: webhookUrl.trim() || null,
        tags: parseCommaList(tags),
        is_paused: isPaused,
      };

      await onSubmit(payload);
      setSuccess(mode === "create" ? "Monitor created successfully." : "Monitor updated successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save monitor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {success ? <Notice tone="success">{success}</Notice> : null}

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <Field label="Monitor name">
          <Input value={name} onChange={setName} placeholder="Payments API" />
        </Field>
        <Field label="HTTP method">
          <select
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            style={inputStyle}
          >
            {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Endpoint URL">
        <Input value={url} onChange={setUrl} placeholder="https://api.example.com/health" />
      </Field>

      <Field label="Description">
        <TextArea
          value={description}
          onChange={setDescription}
          placeholder="What this endpoint covers and who owns it"
        />
      </Field>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <Field label="Check interval (seconds)">
          <Input value={checkInterval} onChange={setCheckInterval} type="number" min={30} />
        </Field>
        <Field label="Timeout (seconds)">
          <Input value={timeout} onChange={setTimeoutValue} type="number" min={1} step="0.5" />
        </Field>
        <Field label="Retry count">
          <Input value={retryCount} onChange={setRetryCount} type="number" min={0} max={3} />
        </Field>
        <Field label="Alert threshold">
          <Input value={alertThreshold} onChange={setAlertThreshold} type="number" min={1} />
        </Field>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <Field label="Expected status codes">
          <Input
            value={expectedStatusCodes}
            onChange={setExpectedStatusCodes}
            placeholder="200,201,204"
          />
        </Field>
        <Field label="Notification channels">
          <Input
            value={notificationChannels}
            onChange={setNotificationChannels}
            placeholder="email,slack,webhook"
          />
        </Field>
      </div>

      <Field label="Webhook URL">
        <Input value={webhookUrl} onChange={setWebhookUrl} placeholder="https://hooks.example.com/alerts" />
      </Field>

      <Field label="Tags">
        <Input value={tags} onChange={setTags} placeholder="production, payments, critical" />
      </Field>

      <Field label="Headers JSON">
        <TextArea
          value={headersText}
          onChange={setHeadersText}
          placeholder={'{\n  "Authorization": "Bearer <token>",\n  "X-Region": "us-east-1"\n}'}
          rows={6}
        />
      </Field>

      <Field label="Request body">
        <TextArea
          value={body}
          onChange={setBody}
          placeholder='{"health":"check"}'
          rows={6}
        />
      </Field>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#cfd4f0",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        <input
          type="checkbox"
          checked={isPaused}
          onChange={(event) => setIsPaused(event.target.checked)}
          style={{ accentColor: "#5b4af7" }}
        />
        Create this monitor in a paused state
      </label>

      <button
        type="submit"
        disabled={submitting}
        style={{
          border: "none",
          borderRadius: 14,
          background: "linear-gradient(135deg, #3b5ce4, #5b4af7)",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          padding: "14px 18px",
          cursor: "pointer",
          opacity: submitting ? 0.65 : 1,
        }}
      >
        {submitting ? "Saving monitor..." : submitLabel ?? (mode === "create" ? "Create monitor" : "Save changes")}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#7d84a4",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      {...props}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={inputStyle}
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 4,
  ...props
}: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      {...props}
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={{
        ...inputStyle,
        minHeight: rows * 24,
        resize: "vertical",
      }}
    />
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#eef0ff",
  padding: "12px 14px",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};
