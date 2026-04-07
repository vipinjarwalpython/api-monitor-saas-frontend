import api from "../axios";
import type { MonitorLog, MonitorStats } from "@/types";

const ANALYTICS_ENDPOINTS = {
  LOGS: (monitorId: number) => `/api/v1/analytics/logs/${monitorId}`,
  STATS: (monitorId: number) => `/api/v1/analytics/stats/${monitorId}`,
};

interface GetLogsParams {
  skip?: number;
  limit?: number;
  status?: boolean;
}

/**
 * Get logs for a specific monitor
 * GET /api/v1/analytics/logs/{monitor_id}
 */
export const getMonitorLogs = async (
  monitorId: number,
  params?: GetLogsParams
): Promise<MonitorLog[]> => {
  const defaultParams = {
    skip: 0,
    limit: 100,
    ...params,
  };
  const response = await api.get<MonitorLog[]>(ANALYTICS_ENDPOINTS.LOGS(monitorId), {
    params: defaultParams,
  });
  return response.data;
};

/**
 * Get statistics for a specific monitor
 * GET /api/v1/analytics/stats/{monitor_id}
 */
export const getMonitorStats = async (monitorId: number): Promise<MonitorStats> => {
  const response = await api.get<MonitorStats>(ANALYTICS_ENDPOINTS.STATS(monitorId));
  return response.data;
};
