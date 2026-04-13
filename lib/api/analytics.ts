import api from "../axios";
import type {
  AnalyticsDashboardOverview,
  AnalyticsMonitorStats,
  MonitorLog,
} from "@/types";

const ANALYTICS_ENDPOINTS = {
  LOGS: (monitorId: number) => `/api/v1/analytics/logs/${monitorId}`,
  STATS: (monitorId: number) => `/api/v1/analytics/stats/${monitorId}`,
  DASHBOARD_OVERVIEW: "/api/v1/analytics/dashboard-overview",
} as const;

export interface AnalyticsLogsParams {
  skip?: number;
  limit?: number;
  hours?: number;
}

export async function getMonitorLogs(monitorId: number, params?: AnalyticsLogsParams) {
  const response = await api.get<MonitorLog[]>(ANALYTICS_ENDPOINTS.LOGS(monitorId), {
    params: {
      skip: 0,
      limit: 100,
      hours: 24,
      ...params,
    },
  });
  return response.data;
}

export async function getMonitorStats(monitorId: number, hours = 24) {
  const response = await api.get<AnalyticsMonitorStats>(ANALYTICS_ENDPOINTS.STATS(monitorId), {
    params: { hours },
  });
  return response.data;
}

export async function getDashboardOverview(hours = 24) {
  const response = await api.get<AnalyticsDashboardOverview>(
    ANALYTICS_ENDPOINTS.DASHBOARD_OVERVIEW,
    {
      params: { hours },
    }
  );
  return response.data;
}
