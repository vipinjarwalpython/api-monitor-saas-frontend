"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { analyticsAPI, monitorAPI } from "@/lib/api";
import type { AnalyticsMonitorStats, MonitorStats } from "@/types";
import { Card, LoadingBlock, Notice, StatCard, StatGrid } from "@/components/dashboard/ui";
import { ResponseTimeChart, SuccessFailureChart } from "@/components/dashboard/charts";
import { formatResponseTimeSeconds } from "@/lib/format";
import { extractApiError } from "@/lib/api/utils";

const HOUR_PRESETS = [24, 72, 168, 720];

export default function StatsTab() {
  const params = useParams();
  const monitorId = Number(params.id);
  const [hours, setHours] = useState(24);
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsMonitorStats | null>(null);
  const [lifetimeStats, setLifetimeStats] = useState<MonitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError("");

      try {
        const [analyticsStatsResponse, lifetimeStatsResponse] = await Promise.all([
          analyticsAPI.getMonitorStats(monitorId, hours),
          monitorAPI.getMonitorStats(monitorId),
        ]);

        setAnalyticsStats(analyticsStatsResponse);
        setLifetimeStats(lifetimeStatsResponse);
      } catch (statsError) {
        setError(extractApiError(statsError, "Unable to load monitor analytics."));
      } finally {
        setLoading(false);
      }
    }

    if (Number.isFinite(monitorId)) {
      loadStats();
    }
  }, [monitorId, hours]);

  if (loading) {
    return <LoadingBlock label="Loading monitor analytics..." />;
  }

  if (error || !analyticsStats || !lifetimeStats) {
    return <Notice tone="error">{error || "Analytics are not available for this monitor yet."}</Notice>;
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card
        title="Time window"
        subtitle="The analytics endpoint supports hour-based lookbacks for focused troubleshooting."
        action={
          <select
            value={hours}
            onChange={(event) => setHours(Number(event.target.value))}
            style={inputStyle}
          >
            {HOUR_PRESETS.map((value) => (
              <option key={value} value={value}>
                Last {value}h
              </option>
            ))}
          </select>
        }
      >
        <StatGrid>
          <StatCard label="Window checks" value={analyticsStats.total_checks} hint={`${analyticsStats.success_checks} successful`} />
          <StatCard label="Window uptime" value={`${analyticsStats.uptime_percent.toFixed(2)}%`} hint={`${analyticsStats.failure_checks} failures`} />
          <StatCard label="Average latency" value={formatResponseTimeSeconds(analyticsStats.avg_response_time)} hint={`Timeframe: ${analyticsStats.timeframe_hours}h`} />
          <StatCard label="Lifetime checks" value={lifetimeStats.total_checks} hint={`Lifetime uptime ${lifetimeStats.uptime_percent.toFixed(2)}%`} />
        </StatGrid>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        <Card title="Success vs failure" subtitle="Aggregated from the analytics stats endpoint.">
          <div style={{ maxWidth: 320, margin: "0 auto" }}>
            <SuccessFailureChart
              successChecks={analyticsStats.success_checks}
              failureChecks={analyticsStats.failure_checks}
            />
          </div>
        </Card>

        <Card title="Response time spread" subtitle="Minimum, average, and maximum latency within the selected window.">
          <div style={{ height: 260 }}>
            <ResponseTimeChart
              minimum={analyticsStats.min_response_time}
              average={analyticsStats.avg_response_time}
              maximum={analyticsStats.max_response_time}
            />
          </div>
        </Card>
      </div>
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
