import api from "../axios";
import type {
  BillingHistoryResponse,
  CancelSubscriptionRequest,
  CurrentPlanResponse,
  PlanComparisonResponse,
  PurchaseHistoryResponse,
  PurchaseSubscriptionRequest,
  PurchaseSubscriptionResponse,
  SubscriptionDetail,
  SubscriptionInfo,
  SubscriptionPlan,
  SubscriptionSettingsResponse,
  SubscriptionSettingsUpdate,
  SubscriptionStatsResponse,
  TrialInfoResponse,
  UpgradeRequest,
  UsageResponse,
} from "@/types";

const SUBSCRIPTION_ENDPOINTS = {
  PLANS: "/api/v2/subscription/plans",
  PLAN: (planId: number) => `/api/v2/subscription/plans/${planId}`,
  PLANS_COMPARE: "/api/v2/subscription/plans/compare",
  PURCHASE: "/api/v2/subscription/purchase",
  MY_PLAN: "/api/v2/subscription/my-plan",
  MY_SUBSCRIPTION: "/api/v2/subscription/my-subscription",
  MY_SUBSCRIPTION_USAGE: "/api/v2/subscription/my-subscription/usage",
  UPGRADE: "/api/v2/subscription/upgrade",
  CANCEL: "/api/v2/subscription/cancel",
  RESUME: "/api/v2/subscription/resume",
  INVOICES: "/api/v2/subscription/invoices",
  TRIAL_INFO: "/api/v2/subscription/trial-info",
  STATS: "/api/v2/subscription/stats",
  SETTINGS: "/api/v2/subscription/settings",
  CURRENT_PLAN: "/api/v2/subscription/current-plan",
  PURCHASE_HISTORY: "/api/v2/subscription/purchase-history",
} as const;

export async function getPlans(params?: { tier?: string; is_active?: boolean }) {
  const response = await api.get<SubscriptionPlan[]>(SUBSCRIPTION_ENDPOINTS.PLANS, {
    params,
  });
  return response.data;
}

export async function getPlan(planId: number) {
  const response = await api.get<SubscriptionPlan>(SUBSCRIPTION_ENDPOINTS.PLAN(planId));
  return response.data;
}

export async function comparePlans(planIds: number[]) {
  const response = await api.get<PlanComparisonResponse>(SUBSCRIPTION_ENDPOINTS.PLANS_COMPARE, {
    params: {
      plan_ids: planIds.join(","),
    },
  });
  return response.data;
}

export async function purchasePlan(payload: PurchaseSubscriptionRequest) {
  const response = await api.post<PurchaseSubscriptionResponse>(
    SUBSCRIPTION_ENDPOINTS.PURCHASE,
    payload
  );
  return response.data;
}

export async function getMyPlan() {
  const response = await api.get<SubscriptionPlan>(SUBSCRIPTION_ENDPOINTS.MY_PLAN);
  return response.data;
}

export async function getMySubscription() {
  const response = await api.get<SubscriptionDetail>(SUBSCRIPTION_ENDPOINTS.MY_SUBSCRIPTION);
  return response.data;
}

export async function getUsage() {
  const response = await api.get<UsageResponse>(SUBSCRIPTION_ENDPOINTS.MY_SUBSCRIPTION_USAGE);
  return response.data;
}

export async function upgradeSubscription(payload: UpgradeRequest) {
  const response = await api.post<SubscriptionInfo>(SUBSCRIPTION_ENDPOINTS.UPGRADE, payload);
  return response.data;
}

export async function cancelSubscription(payload: CancelSubscriptionRequest) {
  const response = await api.post<SubscriptionInfo>(SUBSCRIPTION_ENDPOINTS.CANCEL, payload);
  return response.data;
}

export async function resumeSubscription() {
  const response = await api.post<SubscriptionInfo>(SUBSCRIPTION_ENDPOINTS.RESUME);
  return response.data;
}

export async function getInvoices(params?: { page?: number; page_size?: number; status?: string }) {
  const response = await api.get<BillingHistoryResponse>(SUBSCRIPTION_ENDPOINTS.INVOICES, {
    params: {
      page: 1,
      page_size: 20,
      ...params,
    },
  });
  return response.data;
}

export async function getTrialInfo() {
  const response = await api.get<TrialInfoResponse>(SUBSCRIPTION_ENDPOINTS.TRIAL_INFO);
  return response.data;
}

export async function getStats() {
  const response = await api.get<SubscriptionStatsResponse>(SUBSCRIPTION_ENDPOINTS.STATS);
  return response.data;
}

export async function getSettings() {
  const response = await api.get<SubscriptionSettingsResponse>(SUBSCRIPTION_ENDPOINTS.SETTINGS);
  return response.data;
}

export async function updateSettings(payload: SubscriptionSettingsUpdate) {
  const response = await api.put<SubscriptionSettingsResponse>(
    SUBSCRIPTION_ENDPOINTS.SETTINGS,
    payload
  );
  return response.data;
}

export async function getCurrentPlan() {
  const response = await api.get<CurrentPlanResponse>(SUBSCRIPTION_ENDPOINTS.CURRENT_PLAN);
  return response.data;
}

export async function getPurchaseHistory() {
  const response = await api.get<PurchaseHistoryResponse>(
    SUBSCRIPTION_ENDPOINTS.PURCHASE_HISTORY
  );
  return response.data;
}
