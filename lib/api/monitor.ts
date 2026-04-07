import api from "../axios";
import type {
  CreateMonitorRequest,
  Monitor,
  UpdateMonitorRequest,
  MonitorListResponse,
  MonitorDetailsResponse,
  MyApi,
  PauseResumeResponse,
} from "@/types";

const MONITOR_ENDPOINTS = {
  ADD: "/api/v1/monitor/add-api",
  LIST: "/api/v1/monitor/list-api",
  GET_ONE: (id: number) => `/api/v1/monitor/${id}`,
  UPDATE: (id: number) => `/api/v1/monitor/${id}`,
  DELETE: (id: number) => `/api/v1/monitor/delete-api/${id}`,
  MY_APIS: "/api/v1/monitor/my-apis",
  PAUSE: (id: number) => `/api/v1/monitor/${id}/pause`,
  RESUME: (id: number) => `/api/v1/monitor/${id}/resume`,
};

interface ListMonitorsParams {
  skip?: number;
  limit?: number;
  is_down?: boolean;
  sort_by?: "created_at" | "name" | "status" | "failure_count";
  sort_order?: "asc" | "desc";
}

/**
 * Create a new monitor
 * POST /api/v1/monitor/add-api
 */
export const createMonitor = async (data: CreateMonitorRequest): Promise<Monitor> => {
  const payload = {
    ...data,
    expected_status_codes: Array.isArray(data.expected_status_codes)
      ? data.expected_status_codes.join(",")
      : data.expected_status_codes,
  };
  const response = await api.post<Monitor>(MONITOR_ENDPOINTS.ADD, payload);
  return response.data;
};

/**
 * List all monitors with pagination and filtering
 * GET /api/v1/monitor/list-api
 */
export const listMonitors = async (params?: ListMonitorsParams): Promise<Monitor[]> => {
  const defaultParams = {
    skip: 0,
    limit: 50,
    ...params,
  };
  const response = await api.get<Monitor[]>(MONITOR_ENDPOINTS.LIST, { params: defaultParams });
  return response.data;
};

/**
 * Get details of a single monitor
 * GET /api/v1/monitor/{monitor_id}
 */
export const getMonitorDetails = async (monitorId: number): Promise<MonitorDetailsResponse> => {
  const response = await api.get<MonitorDetailsResponse>(MONITOR_ENDPOINTS.GET_ONE(monitorId));
  return response.data;
};

/**
 * Update a monitor (partial update)
 * PUT /api/v1/monitor/{monitor_id}
 */
export const updateMonitor = async (
  monitorId: number,
  data: UpdateMonitorRequest
): Promise<Monitor> => {
  const payload = {
    ...data,
    expected_status_codes: data.expected_status_codes
      ? Array.isArray(data.expected_status_codes)
        ? data.expected_status_codes.join(",")
        : data.expected_status_codes
      : undefined,
  };
  const response = await api.put<Monitor>(MONITOR_ENDPOINTS.UPDATE(monitorId), payload);
  return response.data;
};

/**
 * Delete a monitor
 * DELETE /api/v1/monitor/delete-api/{monitor_id}
 */
export const deleteMonitor = async (monitorId: number): Promise<void> => {
  await api.delete(MONITOR_ENDPOINTS.DELETE(monitorId));
};

/**
 * Get current user's monitors (simplified list)
 * GET /api/v1/monitor/my-apis
 */
export const getMyAPIs = async (): Promise<MyApi[]> => {
  const response = await api.get<MyApi[]>(MONITOR_ENDPOINTS.MY_APIS);
  return response.data;
};

/**
 * Pause a monitor
 * PATCH /api/v1/monitor/{monitor_id}/pause
 */
export const pauseMonitor = async (monitorId: number): Promise<PauseResumeResponse> => {
  const response = await api.patch<PauseResumeResponse>(
    MONITOR_ENDPOINTS.PAUSE(monitorId)
  );
  return response.data;
};

/**
 * Resume a monitor
 * PATCH /api/v1/monitor/{monitor_id}/resume
 */
export const resumeMonitor = async (monitorId: number): Promise<PauseResumeResponse> => {
  const response = await api.patch<PauseResumeResponse>(
    MONITOR_ENDPOINTS.RESUME(monitorId)
  );
  return response.data;
};
