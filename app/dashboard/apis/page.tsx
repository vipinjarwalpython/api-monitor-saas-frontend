"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { monitorAPI } from "@/lib/api";
import type { MonitorListItem, MyApi } from "@/types";
import {
  ActionButton,
  Card,
  DashboardPage,
  EmptyState,
  LoadingBlock,
  Notice,
  StatusPill,
  ThemedSelect,
} from "@/components/dashboard/ui";
import { formatRelativeTime, formatResponseTimeSeconds } from "@/lib/format";
import { extractApiError } from "@/lib/api/utils";
import { getMonitorHealthState, type MonitorHealthState } from "@/lib/monitor-health";

interface MonitorRow extends MonitorListItem {
  response_time?: number | null;
  last_checked_at?: string | null;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All monitors" },
  { value: "healthy", label: "Healthy only" },
  { value: "down", label: "Down only" },
  { value: "paused", label: "Paused only" },
];

const SORT_OPTIONS = [
  { value: "created_at", label: "Newest first" },
  { value: "name", label: "Name" },
  { value: "status", label: "Status" },
  { value: "failure_count", label: "Failure count" },
];

export default function ApiListPage() {
  const router = useRouter();
  const [monitors, setMonitors] = useState<MonitorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MonitorHealthState>("all");
  const [sortBy, setSortBy] = useState<"created_at" | "name" | "status" | "failure_count">("created_at");

  const loadMonitors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [listResponse, myApisResponse] = await Promise.all([
        monitorAPI.listMonitors({
          limit: 100,
          sort_by: sortBy,
          sort_order: sortBy === "name" ? "asc" : "desc",
        }),
        monitorAPI.getMyAPIs(),
      ]);

      const byId = new Map<number, MyApi>(myApisResponse.map((item) => [item.id, item]));
      const details = await Promise.all(listResponse.map((item) => monitorAPI.getMonitorDetails(item.id)));
      const detailsById = new Map(details.map((item) => [item.id, item]));

      const rows = listResponse.map((item) => {
        const myApi = byId.get(item.id);
        const details = detailsById.get(item.id);
        const lastChecked = details?.last_checked ?? item.last_checked ?? myApi?.last_checked_at ?? null;

        return {
          ...item,
          status: details?.status ?? item.status ?? myApi?.status,
          is_down: details?.is_down ?? item.is_down ?? myApi?.is_down ?? false,
          is_paused: details?.is_paused ?? item.is_paused ?? myApi?.is_paused ?? false,
          failure_count: details?.failure_count ?? item.failure_count ?? myApi?.failure_count ?? 0,
          last_checked: lastChecked,
          last_checked_at: myApi?.last_checked_at ?? lastChecked,
          last_response_time: details?.last_response_time ?? item.last_response_time ?? null,
          response_time: myApi?.response_time ?? details?.last_response_time ?? item.last_response_time ?? null,
        };
      });

      setMonitors(
        statusFilter === "all"
          ? rows
          : rows.filter((item) => getMonitorHealthState(item) === statusFilter)
      );
    } catch (loadError) {
      setError(extractApiError(loadError, "Unable to load monitors."));
    } finally {
      setLoading(false);
    }
  }, [sortBy, statusFilter]);

  useEffect(() => {
    loadMonitors();
  }, [loadMonitors]);

  async function handlePauseResume(item: MonitorRow) {
    setBusyId(item.id);
    setError("");
    setNotice("");

    try {
      const details = await monitorAPI.getMonitorDetails(item.id);

      if (details.is_paused) {
        await monitorAPI.resumeMonitor(item.id);
        setNotice(`Resumed monitor "${item.name}".`);
      } else {
        await monitorAPI.pauseMonitor(item.id);
        setNotice(`Paused monitor "${item.name}".`);
      }
      await loadMonitors();
    } catch (actionError) {
      setError(extractApiError(actionError, "Unable to update monitor state."));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item: MonitorRow) {
    const confirmed = window.confirm(`Delete "${item.name}"? This removes the monitor and its logs.`);
    if (!confirmed) {
      return;
    }

    setBusyId(item.id);
    setError("");
    setNotice("");

    try {
      await monitorAPI.deleteMonitor(item.id);
      setNotice(`Deleted monitor "${item.name}".`);
      await loadMonitors();
    } catch (deleteError) {
      setError(extractApiError(deleteError, "Unable to delete monitor."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardPage
      eyebrow="Monitors"
      title="API monitors"
      subtitle="Filter, pause, resume, inspect, and update every monitor from one place."
      actions={
        <>
          <ActionButton tone="ghost" onClick={() => loadMonitors()}>
            Refresh
          </ActionButton>
          <ActionButton onClick={() => router.push("/dashboard/add-api")}>Add monitor</ActionButton>
        </>
      }
    >
      {error ? <Notice tone="error">{error}</Notice> : null}
      {notice ? <Notice tone="success">{notice}</Notice> : null}

      <Card
        title="Filter and sort"
        subtitle="Use the current backend list endpoint to narrow what you see."
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          <label style={labelStyle}>
            <span>Status filter</span>
            <ThemedSelect
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={(value) => setStatusFilter(value as typeof statusFilter)}
              ariaLabel="Status filter"
            />
          </label>
          <label style={labelStyle}>
            <span>Sort by</span>
            <ThemedSelect
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={(value) => setSortBy(value as typeof sortBy)}
              ariaLabel="Sort monitors"
            />
          </label>
        </div>
      </Card>

      <div style={{ height: 16 }} />

      {loading ? (
        <LoadingBlock label="Loading monitors..." />
      ) : monitors.length === 0 ? (
        <EmptyState
          title="No monitors match this view"
          description="Try another filter or create a new monitor to begin tracking uptime and response times."
          action={<ActionButton onClick={() => router.push("/dashboard/add-api")}>Create monitor</ActionButton>}
        />
      ) : (
        <Card title={`Monitors (${monitors.length})`} subtitle="Each row maps to the current monitor and recent activity endpoints.">
          <div style={{ display: "grid", gap: 12 }}>
            {monitors.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gap: 14,
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                  padding: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</div>
                    <div style={{ color: "#7d84a4", fontSize: 12, marginTop: 6 }}>{item.url}</div>
                  </div>
                  <StatusPill status={item.status} isDown={item.is_down} paused={item.is_paused} />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 12,
                    color: "#cdd3ee",
                    fontSize: 13,
                  }}
                >
                  <Metric label="Last check" value={formatRelativeTime(item.last_checked_at ?? item.last_checked)} />
                  <Metric label="Response time" value={formatResponseTimeSeconds(item.response_time ?? item.last_response_time)} />
                  <Metric label="Failures" value={String(item.failure_count)} />
                  <Metric label="Monitor ID" value={`#${item.id}`} />
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <ActionButton tone="ghost" onClick={() => router.push(`/dashboard/api/${item.id}`)}>
                    View details
                  </ActionButton>
                  <ActionButton
                    tone="ghost"
                    onClick={() => router.push(`/dashboard/api/${item.id}?tab=edit`)}
                  >
                    Edit
                  </ActionButton>
                  <ActionButton
                    tone="ghost"
                    disabled={busyId === item.id}
                    onClick={() => handlePauseResume(item)}
                  >
                    {busyId === item.id ? "Updating..." : item.is_paused ? "Resume" : "Pause"}
                  </ActionButton>
                  <ActionButton
                    tone="danger"
                    disabled={busyId === item.id}
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </DashboardPage>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "#7d84a4", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div style={{ marginTop: 6, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  fontSize: 12,
  fontWeight: 600,
  color: "#7d84a4",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

