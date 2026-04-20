"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { analyticsAPI } from "@/lib/api";
import type { MonitorLog } from "@/types";
import { Card, LoadingBlock, Notice, StatusPill, ThemedSelect } from "@/components/dashboard/ui";
import { formatDateTime, formatResponseTimeSeconds } from "@/lib/format";
import { extractApiError } from "@/lib/api/utils";

const HOUR_OPTIONS = [
  { value: "24", label: "Last 24h" },
  { value: "72", label: "Last 72h" },
  { value: "168", label: "Last 7d" },
  { value: "720", label: "Last 30d" },
];

export default function LogsTab() {
  const params = useParams();
  const monitorId = Number(params.id);
  const [hours, setHours] = useState(24);
  const [logs, setLogs] = useState<MonitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      setError("");

      try {
        const response = await analyticsAPI.getMonitorLogs(monitorId, {
          hours,
          limit: 100,
        });
        setLogs(response);
      } catch (logsError) {
        setError(extractApiError(logsError, "Unable to load monitor logs."));
      } finally {
        setLoading(false);
      }
    }

    if (Number.isFinite(monitorId)) {
      loadLogs();
    }
  }, [monitorId, hours]);

  if (loading) {
    return <LoadingBlock label="Loading logs..." />;
  }

  if (error) {
    return <Notice tone="error">{error}</Notice>;
  }

  return (
    <Card
      title="Recent logs"
      subtitle="Every row comes from the analytics log endpoint with an hour-based filter."
      action={
        <ThemedSelect
          value={String(hours)}
          options={HOUR_OPTIONS}
          onChange={(value) => setHours(Number(value))}
          ariaLabel="Log time window"
          style={{ width: 160 }}
        />
      }
    >
      {logs.length === 0 ? (
        <Notice tone="info">No log entries were returned for this time window.</Notice>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                display: "grid",
                gap: 12,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <StatusPill status={log.status ? "UP" : "DOWN"} isDown={!log.status} />
                <span style={{ color: "#7d84a4", fontSize: 12 }}>{formatDateTime(log.created_at)}</span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                <LogMetric label="Status code" value={log.status_code != null ? String(log.status_code) : "N/A"} />
                <LogMetric label="Response time" value={formatResponseTimeSeconds(log.response_time)} />
                <LogMetric label="Retry attempt" value={String(log.retry_attempt)} />
                <LogMetric label="Error type" value={log.error_type || "None"} />
              </div>
              {log.error_message ? (
                <div style={{ color: "#f2a09f", fontSize: 13, lineHeight: 1.7 }}>{log.error_message}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function LogMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "#7d84a4", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div style={{ color: "#eef0ff", fontWeight: 600, marginTop: 6 }}>{value}</div>
    </div>
  );
}
