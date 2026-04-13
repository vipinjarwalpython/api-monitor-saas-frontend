import api from "../axios";
import type {
  Monitor,
  MonitorListItem,
  MonitorLog,
  MonitorPayload,
  MonitorStats,
  MyApi,
  PauseResumeResponse,
  UpdateMonitorRequest,
} from "@/types";
import { normalizeMonitorPayload } from "./utils";

const MONITOR_ENDPOINTS = {
  ADD: "/api/v1/monitor/add-api",
  LIST: "/api/v1/monitor/list-api",
  MY_APIS: "/api/v1/monitor/my-apis",
  LOGS: (id: number) => `/api/v1/monitor/logs/${id}`,
  STATS: (id: number) => `/api/v1/monitor/stats/${id}`,
  GET_ONE: (id: number) => `/api/v1/monitor/${id}`,
  UPDATE: (id: number) => `/api/v1/monitor/${id}`,
  PAUSE: (id: number) => `/api/v1/monitor/${id}/pause`,
  RESUME: (id: number) => `/api/v1/monitor/${id}/resume`,
  DELETE: (id: number) => `/api/v1/monitor/delete-api/${id}`,
} as const;

export interface ListMonitorsParams {
  skip?: number;
  limit?: number;
  is_down?: boolean;
  sort_by?: "created_at" | "name" | "status" | "failure_count";
  sort_order?: "asc" | "desc";
}

export interface MonitorLogsParams {
  skip?: number;
  limit?: number;
  status?: boolean;
}

export async function createMonitor(data: MonitorPayload) {
  const response = await api.post<Monitor>(MONITOR_ENDPOINTS.ADD, normalizeMonitorPayload(data));
  return response.data;
}

export async function listMonitors(params?: ListMonitorsParams) {
  const response = await api.get<MonitorListItem[]>(MONITOR_ENDPOINTS.LIST, {
    params: {
      skip: 0,
      limit: 50,
      ...params,
    },
  });
  return response.data;
}

export async function getMyAPIs() {
  const response = await api.get<MyApi[]>(MONITOR_ENDPOINTS.MY_APIS);
  return response.data;
}

export async function getMonitorDetails(monitorId: number) {
  const response = await api.get<Monitor>(MONITOR_ENDPOINTS.GET_ONE(monitorId));
  return response.data;
}

export async function updateMonitor(monitorId: number, data: UpdateMonitorRequest) {
  const response = await api.put<Monitor>(
    MONITOR_ENDPOINTS.UPDATE(monitorId),
    normalizeMonitorPayload(data)
  );
  return response.data;
}

export async function deleteMonitor(monitorId: number) {
  await api.delete(MONITOR_ENDPOINTS.DELETE(monitorId));
}

export async function pauseMonitor(monitorId: number) {
  const response = await api.patch<PauseResumeResponse>(MONITOR_ENDPOINTS.PAUSE(monitorId));
  return response.data;
}

export async function resumeMonitor(monitorId: number) {
  const response = await api.patch<PauseResumeResponse>(MONITOR_ENDPOINTS.RESUME(monitorId));
  return response.data;
}

export async function getMonitorLogs(monitorId: number, params?: MonitorLogsParams) {
  const response = await api.get<MonitorLog[]>(MONITOR_ENDPOINTS.LOGS(monitorId), {
    params: {
      skip: 0,
      limit: 100,
      ...params,
    },
  });
  return response.data;
}

export async function getMonitorStats(monitorId: number) {
  const response = await api.get<MonitorStats>(MONITOR_ENDPOINTS.STATS(monitorId));
  return response.data;
}
