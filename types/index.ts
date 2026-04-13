export type MoneyValue = number | string;

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  company?: string | null;
}

export interface AuthUser {
  id: number;
  email: string;
  name?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface UserProfile {
  id: number;
  email: string;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  is_active: boolean;
  verified_email: boolean;
  subscription_status: string;
  created_at: string;
  last_login_at?: string | null;
}

export interface UpdateProfileRequest {
  name?: string | null;
  phone?: string | null;
  company?: string | null;
}

export interface UserStats {
  total_monitors: number;
  active_monitors: number;
  down_monitors: number;
  avg_response_time: number;
  uptime_percent: number;
}

export interface UserSubscriptionSummary {
  status: string;
  plan: string;
  email: string;
}

export interface MonitorPayload {
  name: string;
  url: string;
  description?: string | null;
  check_interval?: number;
  method?: string;
  headers?: Record<string, string> | null;
  body?: string | null;
  expected_status_codes?: string | number[];
  timeout?: number;
  retry_count?: number;
  alert_threshold?: number;
  is_paused?: boolean;
  notification_channels?: string;
  webhook_url?: string | null;
  tags?: string | string[] | null;
}

export type UpdateMonitorRequest = Partial<MonitorPayload>;

export interface Monitor {
  id: number;
  name: string;
  url: string;
  description?: string | null;
  method: string;
  expected_status_codes: string;
  timeout: number;
  is_paused: boolean;
  check_interval: number;
  alert_threshold: number;
  failure_count: number;
  is_down: boolean;
  status: string;
  last_response_time?: number | null;
  last_status_code?: number | null;
  last_checked?: string | null;
  tags?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonitorListItem {
  id: number;
  name: string;
  url: string;
  status: string;
  is_down: boolean;
  last_checked?: string | null;
  failure_count: number;
}

export interface MyApi {
  id: number;
  name?: string | null;
  url: string;
  status: string;
  last_checked_at?: string | null;
  response_time?: number | null;
}

export interface PauseResumeResponse {
  message: string;
  api_id: number;
}

export interface MonitorLog {
  id: number;
  api_id: number;
  status: boolean;
  status_code?: number | null;
  response_time?: number | null;
  error_message?: string | null;
  error_type?: string | null;
  retry_attempt: number;
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

export interface AnalyticsMonitorStats extends MonitorStats {
  api_id: number;
  api_name: string;
  timeframe_hours: number;
}

export interface AnalyticsDashboardOverview {
  total_apis: number;
  healthy_apis: number;
  down_apis: number;
  average_uptime: number;
  avg_response_time: number;
  timeframe_hours: number;
}

export interface DashboardDownMonitor {
  id: number;
  name: string;
  url: string;
  last_checked?: string | null;
  failure_count: number;
}

export interface DashboardOverview {
  user_email: string;
  total_apis: number;
  healthy_apis: number;
  down_apis: number;
  paused_apis: number;
  avg_response_time: number;
  uptime_percent: number;
  timeframe_hours: number;
  down_monitors: DashboardDownMonitor[];
  last_updated: string;
}

export interface DashboardStatus {
  total_apis: number;
  healthy_apis: number;
  down_apis: number;
  health_percentage: number;
}

export interface RecentEvent {
  api_id: number;
  status: string;
  status_code?: number | null;
  error_message?: string | null;
  created_at: string;
}

export interface RecentEventsResponse {
  recent_events: RecentEvent[];
  count: number;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  tier: string;
  price: MoneyValue;
  billing_cycle: string;
  max_monitors: number;
  max_check_interval: number;
  max_alert_channels: number;
  max_api_logs_retention: number;
  max_team_members: number;
  features?: Record<string, boolean> | null;
  sso_enabled: boolean;
  custom_branding: boolean;
  api_access: boolean;
  priority_support: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInfo {
  id: number;
  plan_id: number;
  tier: string;
  status: string;
  billing_cycle: string;
  auto_renew: boolean;
  is_trial: boolean;
  user_id: number;
  start_date: string;
  end_date?: string | null;
  renewal_date?: string | null;
  current_period_start: string;
  current_period_end: string;
  api_monitors_used: number;
  team_members_active: number;
  credit_balance: MoneyValue;
  trial_started_at?: string | null;
  trial_ends_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionDetail extends SubscriptionInfo {
  plan: SubscriptionPlan;
  days_until_renewal: number;
  days_remaining_trial?: number | null;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  subscription_id: number;
  user_id: number;
  amount: MoneyValue;
  tax_amount: MoneyValue;
  total: MoneyValue;
  currency: string;
  invoice_date: string;
  due_date: string;
  paid_at?: string | null;
  status: string;
  payment_method?: string | null;
  items?: Array<Record<string, unknown>> | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseSubscriptionRequest {
  plan_id: number;
  payment_method?: string | null;
  payment_reference?: string | null;
}

export interface PurchaseSubscriptionResponse {
  message: string;
  subscription: SubscriptionInfo;
  plan: SubscriptionPlan;
  invoice: Invoice;
}

export interface UpgradeRequest {
  plan_id: number;
  payment_method?: string | null;
}

export interface CancelSubscriptionRequest {
  reason: string;
  feedback?: string | null;
}

export interface UsageResponse {
  api_monitors_used: number;
  api_monitors_limit: number;
  api_monitors_percentage: number;
  api_logs_count: number;
  api_logs_limit: number;
  api_logs_percentage: number;
  team_members_active: number;
  team_members_limit: number;
  team_members_percentage: number;
}

export interface BillingHistoryResponse {
  invoices: Invoice[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface TrialInfoResponse {
  is_trial: boolean;
  trial_started_at?: string | null;
  trial_ends_at?: string | null;
  days_remaining?: number | null;
  features_available: string[];
}

export interface SubscriptionStatsResponse {
  tier: string;
  status: string;
  renewal_date?: string | null;
  days_until_renewal?: number | null;
  monthly_cost: MoneyValue;
  annual_cost: MoneyValue;
  current_usage: UsageResponse;
  overage_charges?: MoneyValue | null;
}

export interface PlanComparisonResponse {
  plans: SubscriptionPlan[];
  selected_plan_id?: number | null;
}

export interface SubscriptionSettingsUpdate {
  auto_renew?: boolean;
  billing_cycle?: string;
  payment_method?: string | null;
  notification_preferences?: Record<string, unknown> | null;
}

export interface SubscriptionSettingsResponse {
  auto_renew: boolean;
  billing_cycle: string;
  payment_method?: string | null;
  notification_preferences?: Record<string, unknown> | null;
  updated_at: string;
}

export interface CurrentPlanResponse {
  plan: SubscriptionPlan;
  subscription_id: number;
  status: string;
  purchase_date: string;
  start_date: string;
  renewal_date?: string | null;
  end_date?: string | null;
  billing_cycle: string;
  auto_renew: boolean;
  days_until_renewal?: number | null;
  total_spent: MoneyValue;
  next_billing_amount: MoneyValue;
  payment_method?: string | null;
  invoice_count: number;
}

export interface PurchaseHistoryItem {
  id: number;
  plan_name: string;
  tier: string;
  price: MoneyValue;
  billing_cycle: string;
  purchase_date: string;
  start_date: string;
  end_date?: string | null;
  status: string;
  invoice_id?: number | null;
  total_paid: MoneyValue;
}

export interface PurchaseHistoryResponse {
  user_id: number;
  total_purchases: number;
  total_spent: MoneyValue;
  current_plan_purchases: number;
  purchase_history: PurchaseHistoryItem[];
  oldest_purchase_date?: string | null;
  latest_purchase_date?: string | null;
}

export interface PublicStatusResponse {
  status: string;
  timestamp?: string;
  version?: string;
  message?: string;
}

export interface StoredAuthSession {
  token: string;
  user: AuthUser | null;
}
