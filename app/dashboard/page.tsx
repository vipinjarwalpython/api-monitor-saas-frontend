"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { analyticsAPI, dashboardAPI, monitorAPI } from "@/lib/api";
import type {
  AnalyticsDashboardOverview,
  DashboardOverview,
  DashboardStatus,
  MyApi,
  RecentEventsResponse,
} from "@/types";
import {
  ActionButton,
  Card,
  DashboardPage,
  EmptyState,
  LoadingBlock,
  Notice,
  StatCard,
  StatGrid,
  StatusPill,
} from "@/components/dashboard/ui";
import { formatDateTime, formatRelativeTime, formatResponseTimeSeconds } from "@/lib/format";
import { extractApiError } from "@/lib/api/utils";

interface DashboardState {
  overview: DashboardOverview | null;
  status: DashboardStatus | null;
  analytics: AnalyticsDashboardOverview | null;
  recentEvents: RecentEventsResponse | null;
  apis: MyApi[];
}

export default function DashboardHome() {
  const router = useRouter();
  const [state, setState] = useState<DashboardState>({
    overview: null,
    status: null,
    analytics: null,
    recentEvents: null,
    apis: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [overview, status, analytics, recentEvents, apis] = await Promise.all([
        dashboardAPI.getOverview(24),
        dashboardAPI.getStatus(),
        analyticsAPI.getDashboardOverview(24),
        dashboardAPI.getRecentEvents({ limit: 8, hours: 24 }),
        monitorAPI.getMyAPIs(),
      ]);

      setState({
        overview,
        status,
        analytics,
        recentEvents,
        apis,
      });
    } catch (loadError) {
      setError(extractApiError(loadError, "Unable to load dashboard data."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <DashboardPage
      eyebrow="Overview"
      title="Operational overview"
      subtitle="Live health, recent failures, and endpoint activity across your current monitoring window."
      actions={
        <>
          <ActionButton tone="ghost" onClick={() => loadDashboard(true)} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </ActionButton>
          <ActionButton tone="ghost" onClick={() => router.push("/dashboard/subscription")}>
            Subscription
          </ActionButton>
          <ActionButton onClick={() => router.push("/dashboard/add-api")}>Add monitor</ActionButton>
        </>
      }
    >
      {error ? <Notice tone="error">{error}</Notice> : null}

      {loading ? (
        <LoadingBlock label="Loading your dashboard..." />
      ) : state.overview ? (
        <>
          <StatGrid>
            <StatCard
              label="Total monitors"
              value={state.overview.total_apis}
              hint={`${state.overview.healthy_apis} healthy, ${state.overview.down_apis} down`}
            />
            <StatCard
              label="Fleet uptime"
              value={`${state.overview.uptime_percent.toFixed(2)}%`}
              hint={`Window: last ${state.overview.timeframe_hours} hours`}
            />
            <StatCard
              label="Average response"
              value={formatResponseTimeSeconds(state.overview.avg_response_time)}
              hint={`${state.status?.health_percentage ?? 0}% overall health score`}
            />
            <StatCard
              label="Active incidents"
              value={state.recentEvents?.count ?? 0}
              hint={`${state.overview.paused_apis} paused monitors`}
            />
          </StatGrid>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.3fr) minmax(320px, 0.9fr)",
              gap: 16,
              alignItems: "start",
            }}
          >
            <Card
              title="Monitored endpoints"
              subtitle="A quick read on the monitors you own right now."
              action={
                <ActionButton tone="ghost" onClick={() => router.push("/dashboard/apis")}>
                  Manage all
                </ActionButton>
              }
            >
              {state.apis.length === 0 ? (
                <EmptyState
                  title="No monitors yet"
                  description="Create your first monitor to start tracking uptime, latency, and incident history."
                  action={
                    <ActionButton onClick={() => router.push("/dashboard/add-api")}>
                      Create monitor
                    </ActionButton>
                  }
                />
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {state.apis.slice(0, 6).map((api) => (
                    <button
                      key={api.id}
                      onClick={() => router.push(`/dashboard/api/${api.id}`)}
                      style={{
                        display: "grid",
                        gap: 10,
                        padding: 16,
                        textAlign: "left",
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.02)",
                        color: "#eef0ff",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{api.name || "Untitled monitor"}</div>
                          <div style={{ color: "#6f7693", fontSize: 12, marginTop: 4 }}>{api.url}</div>
                        </div>
                        <StatusPill status={api.status} />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                          color: "#9da5c5",
                          fontSize: 12,
                        }}
                      >
                        <span>Last checked {formatRelativeTime(api.last_checked_at)}</span>
                        <span>{formatResponseTimeSeconds(api.response_time)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <div style={{ display: "grid", gap: 16 }}>
              <Card title="Current health split" subtitle="Backend dashboard and analytics endpoints combined.">
                <div style={{ display: "grid", gap: 12 }}>
                  <StatusRow label="Healthy" value={state.overview.healthy_apis} />
                  <StatusRow label="Down" value={state.overview.down_apis} tone="danger" />
                  <StatusRow label="Paused" value={state.overview.paused_apis} tone="warning" />
                  <StatusRow label="Recent failures" value={state.recentEvents?.count ?? 0} tone="danger" />
                </div>
                {state.analytics ? (
                  <div style={{ marginTop: 18, color: "#6f7693", fontSize: 13, lineHeight: 1.6 }}>
                    Analytics overview reports {state.analytics.average_uptime.toFixed(2)}% average uptime with{" "}
                    {formatResponseTimeSeconds(state.analytics.avg_response_time)} average latency in the same window.
                  </div>
                ) : null}
              </Card>

              <Card
                title="Recent events"
                subtitle="The latest failures recorded by the dashboard endpoint."
                action={
                  <ActionButton tone="ghost" onClick={() => router.push("/dashboard/apis")}>
                    Open monitors
                  </ActionButton>
                }
              >
                {state.recentEvents?.recent_events.length ? (
                  <div style={{ display: "grid", gap: 12 }}>
                    {state.recentEvents.recent_events.map((event, index) => (
                      <div
                        key={`${event.api_id}-${event.created_at}-${index}`}
                        style={{
                          borderRadius: 14,
                          border: "1px solid rgba(255,255,255,0.06)",
                          background: "rgba(255,255,255,0.02)",
                          padding: 14,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>Monitor #{event.api_id}</div>
                          <StatusPill status="DOWN" isDown />
                        </div>
                        <div style={{ color: "#d8def7", fontSize: 13 }}>
                          Status code {event.status_code ?? "unknown"}
                        </div>
                        <div style={{ color: "#6f7693", fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>
                          {event.error_message || "The backend recorded a failed check without an error message."}
                        </div>
                        <div style={{ color: "#6f7693", fontSize: 12, marginTop: 8 }}>
                          {formatDateTime(event.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Notice tone="success">No recent failures in the selected 24-hour window.</Notice>
                )}
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </DashboardPage>
  );
}

function StatusRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "danger" | "warning";
}) {
  const color =
    tone === "danger" ? "#f2a09f" : tone === "warning" ? "#f0c56b" : "#9fe7d0";
  const background =
    tone === "danger"
      ? "rgba(226,75,74,0.12)"
      : tone === "warning"
        ? "rgba(239,159,39,0.12)"
        : "rgba(29,158,117,0.12)";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "center",
        borderRadius: 14,
        padding: "12px 14px",
        background,
      }}
    >
      <span style={{ color: "#d8def7", fontSize: 13, fontWeight: 600 }}>{label}</span>
      <span style={{ color, fontSize: 15, fontWeight: 700 }}>{value}</span>
    </div>
  );
}
