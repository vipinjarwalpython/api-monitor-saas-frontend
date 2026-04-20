"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { analyticsAPI, dashboardAPI, monitorAPI } from "@/lib/api";
import type {
  AnalyticsDashboardOverview,
  DashboardOverview,
  Monitor,
  MonitorListItem,
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
import { getMonitorHealthState, summarizeMonitorHealth } from "@/lib/monitor-health";

interface DashboardMonitor extends MonitorListItem {
  response_time?: number | null;
  last_checked_at?: string | null;
}

interface DashboardState {
  overview: DashboardOverview | null;
  analytics: AnalyticsDashboardOverview | null;
  recentEvents: RecentEventsResponse | null;
  apis: DashboardMonitor[];
}

export default function DashboardHome() {
  const router = useRouter();
  const [state, setState] = useState<DashboardState>({
    overview: null,
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
      const [overview, analytics, recentEvents, monitorList, myApis] = await Promise.all([
        dashboardAPI.getOverview(24),
        analyticsAPI.getDashboardOverview(24),
        dashboardAPI.getRecentEvents({ limit: 8, hours: 24 }),
        monitorAPI.listMonitors({ limit: 500, sort_by: "created_at", sort_order: "desc" }),
        monitorAPI.getMyAPIs(),
      ]);

      const apis = await buildDashboardMonitors(monitorList, myApis);

      setState({
        overview,
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

  const healthSummary = summarizeMonitorHealth(state.apis);
  const pausedMonitorIds = new Set(
    state.apis.filter((api) => getMonitorHealthState(api) === "paused").map((api) => api.id)
  );
  const activeRecentEvents =
    state.recentEvents?.recent_events.filter((event) => !pausedMonitorIds.has(event.api_id)) ?? [];
  const activeHealthPercentage =
    healthSummary.active === 0 ? 0 : Math.round((healthSummary.healthy / healthSummary.active) * 100);
  const averageActiveResponseTime = getAverageActiveResponseTime(state.apis);

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
              value={healthSummary.total}
              hint={`${healthSummary.healthy} healthy, ${healthSummary.down} down, ${healthSummary.paused} paused`}
            />
            <StatCard
              label="Active health"
              value={healthSummary.active === 0 ? "N/A" : `${activeHealthPercentage}%`}
              hint={
                healthSummary.active === 0
                  ? "No active monitors"
                  : `${healthSummary.active} active monitors`
              }
            />
            <StatCard
              label="Average response"
              value={formatResponseTimeSeconds(averageActiveResponseTime)}
              hint={`${activeHealthPercentage}% active health score`}
            />
            <StatCard
              label="Active incidents"
              value={healthSummary.down}
              hint={`${healthSummary.paused} paused monitors`}
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
                        <StatusPill status={api.status} isDown={api.is_down} paused={api.is_paused} />
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
                        <span>Last checked {formatRelativeTime(api.last_checked_at ?? api.last_checked)}</span>
                        <span>{formatResponseTimeSeconds(api.response_time ?? api.last_response_time)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <div style={{ display: "grid", gap: 16 }}>
              <Card title="Current health split" subtitle="Latest monitor records with paused checks separated.">
                <div style={{ display: "grid", gap: 12 }}>
                  <StatusRow label="Healthy" value={healthSummary.healthy} />
                  <StatusRow label="Down" value={healthSummary.down} tone="danger" />
                  <StatusRow label="Paused" value={healthSummary.paused} tone="warning" />
                  <StatusRow label="Recent failures" value={activeRecentEvents.length} tone="danger" />
                </div>
                {state.analytics && healthSummary.active > 0 ? (
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
                {activeRecentEvents.length ? (
                  <div style={{ display: "grid", gap: 12 }}>
                    {activeRecentEvents.map((event, index) => (
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

async function buildDashboardMonitors(
  monitorList: MonitorListItem[],
  myApis: MyApi[]
): Promise<DashboardMonitor[]> {
  const baseMonitors = monitorList.length
    ? monitorList
    : myApis.map<MonitorListItem>((api) => ({
        id: api.id,
        name: api.name || "Untitled monitor",
        url: api.url,
        status: api.status,
        is_down: api.is_down ?? api.status.toUpperCase() === "DOWN",
        is_paused: api.is_paused,
        last_checked: api.last_checked_at,
        failure_count: api.failure_count ?? 0,
      }));

  const myApiById = new Map<number, MyApi>(myApis.map((api) => [api.id, api]));
  const details = await Promise.all(baseMonitors.map((api) => monitorAPI.getMonitorDetails(api.id)));
  const detailById = new Map<number, Monitor>(details.map((api) => [api.id, api]));

  return baseMonitors.map((api) => {
    const detail = detailById.get(api.id);
    const myApi = myApiById.get(api.id);
    const lastChecked = detail?.last_checked ?? api.last_checked ?? myApi?.last_checked_at ?? null;
    const responseTime = myApi?.response_time ?? detail?.last_response_time ?? api.last_response_time ?? null;

    return {
      ...api,
      status: detail?.status ?? api.status ?? myApi?.status ?? "UP",
      is_down: detail?.is_down ?? api.is_down ?? myApi?.is_down ?? false,
      is_paused: detail?.is_paused ?? api.is_paused ?? myApi?.is_paused ?? false,
      failure_count: detail?.failure_count ?? api.failure_count ?? myApi?.failure_count ?? 0,
      last_checked: lastChecked,
      last_checked_at: myApi?.last_checked_at ?? lastChecked,
      last_response_time: detail?.last_response_time ?? api.last_response_time ?? null,
      response_time: responseTime,
    };
  });
}

function getAverageActiveResponseTime(monitors: DashboardMonitor[]) {
  const responseTimes = monitors
    .filter((api) => getMonitorHealthState(api) !== "paused")
    .map((api) => api.response_time ?? api.last_response_time)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  if (responseTimes.length === 0) {
    return null;
  }

  return responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length;
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
