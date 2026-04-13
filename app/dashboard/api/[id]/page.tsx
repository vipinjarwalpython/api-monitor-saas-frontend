"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import LogsTab from "./logs";
import StatsTab from "./stats";
import { monitorAPI } from "@/lib/api";
import type { Monitor } from "@/types";
import {
  ActionButton,
  Card,
  DashboardPage,
  LoadingBlock,
  Notice,
  StatusPill,
  Tabs,
} from "@/components/dashboard/ui";
import { MonitorForm } from "@/components/monitors/MonitorForm";
import {
  csvFromUnknown,
  formatDateTime,
  formatRelativeTime,
  formatResponseTimeSeconds,
} from "@/lib/format";
import { extractApiError } from "@/lib/api/utils";

const TAB_OPTIONS = [
  { id: "overview", label: "Overview" },
  { id: "stats", label: "Stats" },
  { id: "logs", label: "Logs" },
  { id: "edit", label: "Edit" },
];

export default function ApiDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const monitorId = Number(params.id);
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    TAB_OPTIONS.some((tab) => tab.id === requestedTab) ? requestedTab! : "overview"
  );
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (requestedTab && TAB_OPTIONS.some((tab) => tab.id === requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  const loadMonitor = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await monitorAPI.getMonitorDetails(monitorId);
      setMonitor(response);
    } catch (loadError) {
      setError(extractApiError(loadError, "Unable to load this monitor."));
    } finally {
      setLoading(false);
    }
  }, [monitorId]);

  useEffect(() => {
    if (Number.isFinite(monitorId)) {
      loadMonitor();
    }
  }, [monitorId, loadMonitor]);

  async function handlePauseResume() {
    if (!monitor) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (monitor.is_paused) {
        await monitorAPI.resumeMonitor(monitor.id);
        setNotice(`Resumed "${monitor.name}".`);
      } else {
        await monitorAPI.pauseMonitor(monitor.id);
        setNotice(`Paused "${monitor.name}".`);
      }
      await loadMonitor();
    } catch (actionError) {
      setError(extractApiError(actionError, "Unable to update monitor state."));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!monitor) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${monitor.name}"? This also removes the monitor's logs and analytics history.`
    );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await monitorAPI.deleteMonitor(monitor.id);
      router.push("/dashboard/apis");
    } catch (deleteError) {
      setError(extractApiError(deleteError, "Unable to delete this monitor."));
      setBusy(false);
    }
  }

  function selectTab(tabId: string) {
    setActiveTab(tabId);
    router.replace(`/dashboard/api/${monitorId}?tab=${tabId}`);
  }

  return (
    <DashboardPage
      eyebrow="Monitor detail"
      title={monitor?.name || "Monitor details"}
      subtitle={monitor?.url || "View monitor configuration, analytics, logs, and update controls."}
      actions={
        <>
          <ActionButton tone="ghost" onClick={() => router.push("/dashboard/apis")}>
            Back to monitors
          </ActionButton>
          <ActionButton tone="ghost" onClick={() => loadMonitor()}>
            Refresh
          </ActionButton>
          <ActionButton tone="ghost" disabled={!monitor || busy} onClick={handlePauseResume}>
            {busy ? "Updating..." : monitor?.is_paused ? "Resume" : "Pause"}
          </ActionButton>
          <ActionButton tone="danger" disabled={!monitor || busy} onClick={handleDelete}>
            Delete
          </ActionButton>
        </>
      }
    >
      {error ? <Notice tone="error">{error}</Notice> : null}
      {notice ? <Notice tone="success">{notice}</Notice> : null}

      {loading ? (
        <LoadingBlock label="Loading monitor..." />
      ) : monitor ? (
        <>
          <div style={{ marginBottom: 18 }}>
            <StatusPill status={monitor.status} isDown={monitor.is_down} paused={monitor.is_paused} />
          </div>

          <Tabs tabs={TAB_OPTIONS} active={activeTab} onChange={selectTab} />

          {activeTab === "overview" ? <OverviewTab monitor={monitor} /> : null}
          {activeTab === "stats" ? <StatsTab /> : null}
          {activeTab === "logs" ? <LogsTab /> : null}
          {activeTab === "edit" ? (
            <Card
              title="Edit monitor"
              subtitle="The backend update endpoint accepts more fields than the monitor detail endpoint currently returns, so some advanced fields may need to be re-entered when editing."
            >
              <Notice tone="info">
                Fields such as headers, request body, webhook URL, and notification channels are editable, but the current backend detail response does not return their saved values for prefill.
              </Notice>
              <div style={{ height: 16 }} />
              <MonitorForm
                mode="edit"
                initialValues={monitor}
                submitLabel="Update monitor"
                onSubmit={async (payload) => {
                  try {
                    await monitorAPI.updateMonitor(monitor.id, payload);
                    setNotice(`Updated "${monitor.name}".`);
                    await loadMonitor();
                    selectTab("overview");
                  } catch (updateError) {
                    const message = extractApiError(updateError, "Unable to update this monitor.");
                    setError(message);
                    throw new Error(message);
                  }
                }}
              />
            </Card>
          ) : null}
        </>
      ) : null}
    </DashboardPage>
  );
}

function OverviewTab({ monitor }: { monitor: Monitor }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
      }}
    >
      <Card title="Configuration" subtitle="Monitor request settings returned by the detail endpoint.">
        <OverviewMetric label="Method" value={monitor.method} />
        <OverviewMetric label="Check interval" value={`${monitor.check_interval}s`} />
        <OverviewMetric label="Timeout" value={`${monitor.timeout}s`} />
        <OverviewMetric label="Expected codes" value={monitor.expected_status_codes} />
        <OverviewMetric label="Tags" value={csvFromUnknown(monitor.tags) || "No tags"} />
      </Card>

      <Card title="Health summary" subtitle="Quick status and lifecycle details for this monitor.">
        <OverviewMetric label="Failure count" value={String(monitor.failure_count)} />
        <OverviewMetric label="Last response time" value={formatResponseTimeSeconds(monitor.last_response_time)} />
        <OverviewMetric label="Last checked" value={formatRelativeTime(monitor.last_checked)} />
        <OverviewMetric label="Created" value={formatDateTime(monitor.created_at)} />
        <OverviewMetric label="Updated" value={formatDateTime(monitor.updated_at)} />
      </Card>
    </div>
  );
}

function OverviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ color: "#7d84a4", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div style={{ color: "#eef0ff", fontWeight: 600, marginTop: 6 }}>{value}</div>
    </div>
  );
}
