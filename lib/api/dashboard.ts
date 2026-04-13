import api from "../axios";
import type {
  DashboardOverview,
  DashboardStatus,
  RecentEventsResponse,
} from "@/types";

const DASHBOARD_ENDPOINTS = {
  OVERVIEW: "/api/v1/dashboard/overview",
  STATUS: "/api/v1/dashboard/status",
  RECENT_EVENTS: "/api/v1/dashboard/recent-events",
} as const;

export async function getOverview(hours = 24) {
  const response = await api.get<DashboardOverview>(DASHBOARD_ENDPOINTS.OVERVIEW, {
    params: { hours },
  });
  return response.data;
}

export async function getStatus() {
  const response = await api.get<DashboardStatus>(DASHBOARD_ENDPOINTS.STATUS);
  return response.data;
}

export async function getRecentEvents(params?: { limit?: number; hours?: number }) {
  const response = await api.get<RecentEventsResponse>(DASHBOARD_ENDPOINTS.RECENT_EVENTS, {
    params: {
      limit: 10,
      hours: 24,
      ...params,
    },
  });
  return response.data;
}
