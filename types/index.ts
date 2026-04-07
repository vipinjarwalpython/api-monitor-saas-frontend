// Auth Types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id: number;
  email: string;
  name: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterResponse extends User {}

// Monitor Types
export interface CreateMonitorRequest {
  name: string;
  url: string;
  description?: string;
  method?: string;
  expected_status_codes?: number[] | string;
  check_interval?: number;
  timeout?: number;
  retry_count?: number;
  alert_threshold?: number;
  headers?: Record<string, string>;
  webhook_url?: string;
  notification_channels?: string;
  tags?: string[];
}

export interface Monitor {
  id: number;
  name: string;
  url: string;
  description?: string;
  method?: string;
  expected_status_codes?: string;
  check_interval?: number;
  timeout?: number;
  retry_count?: number;
  alert_threshold?: number;
  status: "UP" | "DOWN";
  is_down: boolean;
  is_paused: boolean;
  failure_count?: number;
  last_checked_at?: string;
  headers?: Record<string, string>;
  webhook_url?: string;
  notification_channels?: string;
  tags?: string[];
  created_at: string;
  response_time?: number;
}

export interface UpdateMonitorRequest {
  name?: string;
  url?: string;
  description?: string;
  method?: string;
  expected_status_codes?: number[] | string;
  check_interval?: number;
  timeout?: number;
  retry_count?: number;
  alert_threshold?: number;
  headers?: Record<string, string>;
  webhook_url?: string;
  notification_channels?: string;
  tags?: string[];
}

export interface MonitorListResponse extends Monitor {}

export interface MonitorDetailsResponse extends Monitor {}

// Analytics Types
export interface MonitorLog {
  id: number;
  monitor_id: number;
  status_code: number;
  status: boolean;
  response_time: number;
  response_body?: string;
  error_message?: string;
  created_at: string;
}

export interface MonitorStats {
  total_checks: number;
  success_checks: number;
  failure_checks: number;
  uptime_percent: number;
  avg_response_time: number;
  min_response_time: number;
  max_response_time: number;
}

// User Types
export interface UserProfile extends User {
  phone?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
}

export interface UserStats {
  total_monitors: number;
  total_checks: number;
  successful_checks: number;
  failed_checks: number;
  average_uptime: number;
  total_alerts_triggered: number;
  active_monitors: number;
  paused_monitors: number;
}

export interface Subscription {
  id: number;
  tier: "free" | "pro" | "enterprise";
  status: "active" | "inactive" | "expired";
  max_monitors: number;
  current_monitors: number;
  max_check_interval: number;
  supports_webhooks: boolean;
  monthly_price: number;
  renewal_date: string;
}

// Generic API Response Types
export interface APIError {
  error: string;
  details: string | Record<string, string>;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  skip: number;
  limit: number;
  total: number;
}

// Auth State for Context/Store
export interface AuthState {
  user: User | null;
  token: string | null;
  tokenExpiry: number | null;
  isLoading: boolean;
  error: string | null;
}

// User's APIs List Response
export interface MyApi {
  id: number;
  name: string;
  url: string;
  status: "UP" | "DOWN";
  last_checked_at: string;
  response_time: number;
}

// Pause/Resume Response
export interface PauseResumeResponse {
  message: string;
  api_id: number;
}

// Health Check Responses
export interface HealthStatus {
  status: string;
  timestamp: string;
}

export interface HealthStatusV2 extends HealthStatus {
  version: string;
}
