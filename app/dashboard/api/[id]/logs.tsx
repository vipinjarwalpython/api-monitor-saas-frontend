"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { analyticsAPI } from "@/lib/api";
import type { MonitorLog } from "@/types";
import { Card, LoadingBlock, Notice, StatusPill } from "@/components/dashboard/ui";
import { formatDateTime, formatResponseTimeSeconds } from "@/lib/format";
import { extractApiError } from "@/lib/api/utils";

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
        <select
          value={hours}
          onChange={(event) => setHours(Number(event.target.value))}
          style={inputStyle}
        >
          <option value={24}>Last 24h</option>
          <option value={72}>Last 72h</option>
          <option value={168}>Last 7d</option>
          <option value={720}>Last 30d</option>
        </select>
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

const inputStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#eef0ff",
  padding: "10px 12px",
  fontSize: 13,
};
