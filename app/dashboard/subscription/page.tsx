"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { subscriptionAPI } from "@/lib/api";
import type {
  BillingHistoryResponse,
  CurrentPlanResponse,
  PlanComparisonResponse,
  PurchaseHistoryResponse,
  SubscriptionDetail,
  SubscriptionPlan,
  SubscriptionSettingsResponse,
  SubscriptionStatsResponse,
  TrialInfoResponse,
  UsageResponse,
} from "@/types";
import {
  ActionButton,
  Card,
  DashboardPage,
  EmptyState,
  LoadingBlock,
  Notice,
  Tabs,
} from "@/components/dashboard/ui";
import { formatDateTime, formatMoney } from "@/lib/format";
import { extractApiError } from "@/lib/api/utils";

const TAB_OPTIONS = [
  { id: "plans", label: "Plans" },
  { id: "current", label: "Current" },
  { id: "usage", label: "Usage" },
  { id: "billing", label: "Billing" },
  { id: "settings", label: "Settings" },
];

interface SubscriptionState {
  plans: SubscriptionPlan[];
  comparison: PlanComparisonResponse | null;
  currentPlan: CurrentPlanResponse | null;
  mySubscription: SubscriptionDetail | null;
  usage: UsageResponse | null;
  invoices: BillingHistoryResponse | null;
  trialInfo: TrialInfoResponse | null;
  stats: SubscriptionStatsResponse | null;
  settings: SubscriptionSettingsResponse | null;
  purchaseHistory: PurchaseHistoryResponse | null;
}

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState("plans");
  const [state, setState] = useState<SubscriptionState>({
    plans: [],
    comparison: null,
    currentPlan: null,
    mySubscription: null,
    usage: null,
    invoices: null,
    trialInfo: null,
    stats: null,
    settings: null,
    purchaseHistory: null,
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [paymentReference, setPaymentReference] = useState("");
  const [cancelReason, setCancelReason] = useState("No longer needed");
  const [settingsDraft, setSettingsDraft] = useState({
    auto_renew: true,
    billing_cycle: "monthly",
    payment_method: "",
    notification_preferences: "{}",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function optional<T>(fn: () => Promise<T>) {
    try {
      return await fn();
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 404) {
        return null;
      }
      throw requestError;
    }
  }

  const loadSubscription = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const plans = await subscriptionAPI.getPlans();

      const comparison =
        plans.length >= 2
          ? await optional(() =>
              subscriptionAPI.comparePlans(plans.slice(0, 3).map((plan) => plan.id))
            )
          : { plans, selected_plan_id: plans[0]?.id ?? null };

      const [
        currentPlan,
        mySubscription,
        usage,
        invoices,
        trialInfo,
        stats,
        settings,
        purchaseHistory,
      ] = await Promise.all([
        optional(() => subscriptionAPI.getCurrentPlan()),
        optional(() => subscriptionAPI.getMySubscription()),
        optional(() => subscriptionAPI.getUsage()),
        optional(() => subscriptionAPI.getInvoices({ page: 1, page_size: 10 })),
        optional(() => subscriptionAPI.getTrialInfo()),
        optional(() => subscriptionAPI.getStats()),
        optional(() => subscriptionAPI.getSettings()),
        optional(() => subscriptionAPI.getPurchaseHistory()),
      ]);

      setState({
        plans,
        comparison: comparison || { plans, selected_plan_id: plans[0]?.id ?? null },
        currentPlan,
        mySubscription,
        usage,
        invoices,
        trialInfo,
        stats,
        settings,
        purchaseHistory,
      });

      if (settings) {
        setSettingsDraft({
          auto_renew: settings.auto_renew,
          billing_cycle: settings.billing_cycle,
          payment_method: settings.payment_method || "",
          notification_preferences: JSON.stringify(settings.notification_preferences || {}, null, 2),
        });
      }
    } catch (loadError) {
      setError(extractApiError(loadError, "Unable to load subscription data."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  async function runAction(action: () => Promise<unknown>, successMessage: string) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await action();
      setNotice(successMessage);
      await loadSubscription();
    } catch (actionError) {
      setError(extractApiError(actionError, "Subscription action failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardPage
      eyebrow="Subscription"
      title="Plans, billing, and usage"
      subtitle="Compare plans, purchase or upgrade, review invoices, inspect usage, and manage renewal settings from one screen."
      actions={
        <>
          <ActionButton tone="ghost" onClick={() => loadSubscription()}>
            Refresh
          </ActionButton>
        </>
      }
    >
      {error ? <Notice tone="error">{error}</Notice> : null}
      {notice ? <Notice tone="success">{notice}</Notice> : null}

      {loading ? (
        <LoadingBlock label="Loading subscription workspace..." />
      ) : (
        <>
          <Tabs tabs={TAB_OPTIONS} active={activeTab} onChange={setActiveTab} />

          {activeTab === "plans" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <Card title="Purchase details" subtitle="These values are sent to the purchase and upgrade endpoints.">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 16,
                  }}
                >
                  <label style={labelStyle}>
                    <span>Payment method</span>
                    <input
                      value={paymentMethod}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                      style={inputStyle}
                      placeholder="credit_card"
                    />
                  </label>
                  <label style={labelStyle}>
                    <span>Payment reference</span>
                    <input
                      value={paymentReference}
                      onChange={(event) => setPaymentReference(event.target.value)}
                      style={inputStyle}
                      placeholder="Optional internal reference"
                    />
                  </label>
                </div>
              </Card>

              {state.plans.length === 0 ? (
                <EmptyState
                  title="No active plans published"
                  description="The backend returned an empty plans list, so purchase and comparison actions are currently unavailable."
                />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  {state.plans.map((plan) => {
                    const isCurrent = state.currentPlan?.plan.id === plan.id;
                    const isUpgrade = !!state.currentPlan && !isCurrent;

                    return (
                      <Card
                        key={plan.id}
                        title={plan.name}
                        subtitle={`${plan.tier} plan • ${plan.billing_cycle}`}
                        style={isCurrent ? highlightCardStyle : undefined}
                      >
                        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", color: "#eef0ff" }}>
                          {formatMoney(plan.price)}
                        </div>
                        <div style={{ marginTop: 12, color: "#7d84a4", fontSize: 13, lineHeight: 1.7 }}>
                          Up to {plan.max_monitors} monitors, {plan.max_team_members} team member
                          {plan.max_team_members === 1 ? "" : "s"}, {plan.max_api_logs_retention} days of logs, and{" "}
                          {plan.max_alert_channels} alert channel
                          {plan.max_alert_channels === 1 ? "" : "s"}.
                        </div>
                        <div style={{ marginTop: 14, display: "grid", gap: 8, color: "#d8def7", fontSize: 13 }}>
                          <FeatureRow label="API access" enabled={plan.api_access} />
                          <FeatureRow label="SSO" enabled={plan.sso_enabled} />
                          <FeatureRow label="Custom branding" enabled={plan.custom_branding} />
                          <FeatureRow label="Priority support" enabled={plan.priority_support} />
                        </div>
                        <div style={{ marginTop: 18 }}>
                          {isCurrent ? (
                            <ActionButton tone="ghost" disabled>
                              Current plan
                            </ActionButton>
                          ) : (
                            <ActionButton
                              disabled={busy}
                              onClick={() =>
                                runAction(
                                  () =>
                                    isUpgrade
                                      ? subscriptionAPI.upgradeSubscription({
                                          plan_id: plan.id,
                                          payment_method: paymentMethod || undefined,
                                        })
                                      : subscriptionAPI.purchasePlan({
                                          plan_id: plan.id,
                                          payment_method: paymentMethod || undefined,
                                          payment_reference: paymentReference || undefined,
                                        }),
                                  isUpgrade
                                    ? `Upgraded to ${plan.name}.`
                                    : `Purchased ${plan.name}.`
                                )
                              }
                            >
                              {busy ? "Processing..." : isUpgrade ? "Upgrade to this plan" : "Purchase plan"}
                            </ActionButton>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {state.comparison?.plans.length ? (
                <Card title="Plan comparison" subtitle="Rendered from the compare endpoint when available, with a safe fallback to plan data if not.">
                  <div style={{ display: "grid", gap: 10 }}>
                    {state.comparison.plans.map((plan) => (
                      <div
                        key={plan.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.4fr repeat(4, minmax(80px, 1fr))",
                          gap: 12,
                          borderRadius: 14,
                          border: "1px solid rgba(255,255,255,0.06)",
                          background: "rgba(255,255,255,0.02)",
                          padding: 14,
                          color: "#eef0ff",
                        }}
                      >
                        <strong>{plan.name}</strong>
                        <span>{formatMoney(plan.price)}</span>
                        <span>{plan.max_monitors} monitors</span>
                        <span>{plan.max_api_logs_retention}d logs</span>
                        <span>{plan.max_team_members} users</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : null}
            </div>
          ) : null}

          {activeTab === "current" ? (
            state.currentPlan && state.mySubscription ? (
              <div style={{ display: "grid", gap: 16 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  <Card title="Current plan" subtitle="Backed by `GET /api/v2/subscription/current-plan`.">
                    <SummaryRow label="Plan" value={state.currentPlan.plan.name} />
                    <SummaryRow label="Status" value={state.currentPlan.status} />
                    <SummaryRow label="Billing cycle" value={state.currentPlan.billing_cycle} />
                    <SummaryRow label="Renewal date" value={formatDateTime(state.currentPlan.renewal_date)} />
                    <SummaryRow label="Total spent" value={formatMoney(state.currentPlan.total_spent)} />
                    <SummaryRow label="Next billing" value={formatMoney(state.currentPlan.next_billing_amount)} />
                  </Card>

                  <Card title="Subscription detail" subtitle="Backed by `GET /api/v2/subscription/my-subscription`.">
                    <SummaryRow label="Tier" value={state.mySubscription.tier} />
                    <SummaryRow label="Days until renewal" value={String(state.mySubscription.days_until_renewal)} />
                    <SummaryRow label="Auto renew" value={state.mySubscription.auto_renew ? "Enabled" : "Disabled"} />
                    <SummaryRow label="Trial" value={state.mySubscription.is_trial ? "Yes" : "No"} />
                    <SummaryRow label="Started" value={formatDateTime(state.mySubscription.start_date)} />
                    <SummaryRow label="Current period end" value={formatDateTime(state.mySubscription.current_period_end)} />
                  </Card>
                </div>

                <Card title="Lifecycle actions" subtitle="Use the current backend subscription lifecycle endpoints directly.">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 16,
                    }}
                  >
                    <label style={labelStyle}>
                      <span>Cancellation reason</span>
                      <input
                        value={cancelReason}
                        onChange={(event) => setCancelReason(event.target.value)}
                        style={inputStyle}
                      />
                    </label>
                    <div style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap" }}>
                      <ActionButton
                        tone="danger"
                        disabled={busy || state.mySubscription.status === "cancelled"}
                        onClick={() =>
                          runAction(
                            () =>
                              subscriptionAPI.cancelSubscription({
                                reason: cancelReason,
                              }),
                            "Subscription cancelled."
                          )
                        }
                      >
                        Cancel subscription
                      </ActionButton>
                      <ActionButton
                        tone="ghost"
                        disabled={busy || state.mySubscription.status !== "cancelled"}
                        onClick={() =>
                          runAction(() => subscriptionAPI.resumeSubscription(), "Subscription resumed.")
                        }
                      >
                        Resume subscription
                      </ActionButton>
                    </div>
                  </div>
                </Card>

                {state.trialInfo ? (
                  <Card title="Trial information" subtitle="Backed by `GET /api/v2/subscription/trial-info`.">
                    <SummaryRow label="Trial active" value={state.trialInfo.is_trial ? "Yes" : "No"} />
                    <SummaryRow label="Days remaining" value={String(state.trialInfo.days_remaining ?? 0)} />
                    <SummaryRow label="Trial end" value={formatDateTime(state.trialInfo.trial_ends_at)} />
                    <SummaryRow
                      label="Enabled trial features"
                      value={state.trialInfo.features_available.join(", ") || "None listed"}
                    />
                  </Card>
                ) : null}
              </div>
            ) : (
              <EmptyState
                title="No active subscription yet"
                description="You can still compare plans and make a purchase from the Plans tab."
                action={<ActionButton onClick={() => setActiveTab("plans")}>Browse plans</ActionButton>}
              />
            )
          ) : null}

          {activeTab === "usage" ? (
            state.usage || state.stats?.current_usage ? (
              <div style={{ display: "grid", gap: 16 }}>
                <Card title="Usage overview" subtitle="Combined from usage and stats endpoints.">
                  {[state.usage || state.stats?.current_usage].filter(Boolean).map((usage) => {
                    const data = usage!;
                    return (
                      <div key="usage-bars" style={{ display: "grid", gap: 16 }}>
                        <UsageBar label="Monitors" used={data.api_monitors_used} limit={data.api_monitors_limit} percentage={data.api_monitors_percentage} />
                        <UsageBar label="API logs" used={data.api_logs_count} limit={data.api_logs_limit} percentage={data.api_logs_percentage} />
                        <UsageBar label="Team members" used={data.team_members_active} limit={data.team_members_limit} percentage={data.team_members_percentage} />
                      </div>
                    );
                  })}
                </Card>

                {state.stats ? (
                  <Card title="Cost summary" subtitle="Backed by `GET /api/v2/subscription/stats`.">
                    <SummaryRow label="Monthly cost" value={formatMoney(state.stats.monthly_cost)} />
                    <SummaryRow label="Annualized cost" value={formatMoney(state.stats.annual_cost)} />
                    <SummaryRow label="Tier" value={state.stats.tier} />
                    <SummaryRow label="Status" value={state.stats.status} />
                    <SummaryRow
                      label="Overage charges"
                      value={state.stats.overage_charges ? formatMoney(state.stats.overage_charges) : "None"}
                    />
                  </Card>
                ) : null}
              </div>
            ) : (
              <Notice tone="info">Usage metrics are not available until a subscription exists.</Notice>
            )
          ) : null}

          {activeTab === "billing" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <Card title="Invoices" subtitle="Backed by `GET /api/v2/subscription/invoices`.">
                {state.invoices?.invoices.length ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    {state.invoices.invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                          gap: 12,
                          borderRadius: 14,
                          border: "1px solid rgba(255,255,255,0.06)",
                          background: "rgba(255,255,255,0.02)",
                          padding: 14,
                        }}
                      >
                        <strong>{invoice.invoice_number}</strong>
                        <span>{formatMoney(invoice.total, invoice.currency)}</span>
                        <span>{invoice.status}</span>
                        <span>{formatDateTime(invoice.invoice_date)}</span>
                        <span>{invoice.payment_method || "No payment method"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Notice tone="info">No invoices were returned for this account.</Notice>
                )}
              </Card>

              <Card title="Purchase history" subtitle="Backed by `GET /api/v2/subscription/purchase-history`.">
                {state.purchaseHistory?.purchase_history.length ? (
                  <div style={{ display: "grid", gap: 10 }}>
                    <SummaryRow label="Total purchases" value={String(state.purchaseHistory.total_purchases)} />
                    <SummaryRow label="Total spent" value={formatMoney(state.purchaseHistory.total_spent)} />
                    {state.purchaseHistory.purchase_history.map((purchase) => (
                      <div
                        key={purchase.id}
                        style={{
                          borderRadius: 14,
                          border: "1px solid rgba(255,255,255,0.06)",
                          background: "rgba(255,255,255,0.02)",
                          padding: 14,
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{purchase.plan_name}</div>
                        <div style={{ color: "#7d84a4", fontSize: 13, marginTop: 6 }}>
                          {purchase.tier} • {purchase.billing_cycle} • {formatMoney(purchase.total_paid)}
                        </div>
                        <div style={{ color: "#7d84a4", fontSize: 12, marginTop: 6 }}>
                          Purchased {formatDateTime(purchase.purchase_date)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Notice tone="info">No purchase history was returned for this account.</Notice>
                )}
              </Card>
            </div>
          ) : null}

          {activeTab === "settings" ? (
            state.settings ? (
              <Card title="Subscription settings" subtitle="Update renewal and billing preferences using the settings endpoint.">
                <div style={{ display: "grid", gap: 16 }}>
                  <label style={labelStyle}>
                    <span>Billing cycle</span>
                    <select
                      value={settingsDraft.billing_cycle}
                      onChange={(event) =>
                        setSettingsDraft((current) => ({ ...current, billing_cycle: event.target.value }))
                      }
                      style={inputStyle}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </label>
                  <label style={labelStyle}>
                    <span>Payment method</span>
                    <input
                      value={settingsDraft.payment_method}
                      onChange={(event) =>
                        setSettingsDraft((current) => ({ ...current, payment_method: event.target.value }))
                      }
                      style={inputStyle}
                    />
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, color: "#eef0ff" }}>
                    <input
                      type="checkbox"
                      checked={settingsDraft.auto_renew}
                      onChange={(event) =>
                        setSettingsDraft((current) => ({ ...current, auto_renew: event.target.checked }))
                      }
                      style={{ accentColor: "#5b4af7" }}
                    />
                    Auto renew subscription
                  </label>
                  <label style={labelStyle}>
                    <span>Notification preferences JSON</span>
                    <textarea
                      value={settingsDraft.notification_preferences}
                      onChange={(event) =>
                        setSettingsDraft((current) => ({
                          ...current,
                          notification_preferences: event.target.value,
                        }))
                      }
                      rows={6}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </label>
                  <ActionButton
                    disabled={busy}
                    onClick={() =>
                      runAction(
                        () =>
                          subscriptionAPI.updateSettings({
                            auto_renew: settingsDraft.auto_renew,
                            billing_cycle: settingsDraft.billing_cycle,
                            payment_method: settingsDraft.payment_method || undefined,
                            notification_preferences: JSON.parse(
                              settingsDraft.notification_preferences || "{}"
                            ),
                          }),
                        "Subscription settings updated."
                      )
                    }
                  >
                    Save settings
                  </ActionButton>
                </div>
              </Card>
            ) : (
              <Notice tone="info">Subscription settings are not available until a subscription exists.</Notice>
            )
          ) : null}
        </>
      )}
    </DashboardPage>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ color: "#7d84a4", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div style={{ color: "#eef0ff", fontWeight: 600, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function FeatureRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <span>{label}</span>
      <span style={{ color: enabled ? "#7be0c0" : "#7d84a4" }}>{enabled ? "Included" : "No"}</span>
    </div>
  );
}

function UsageBar({
  label,
  used,
  limit,
  percentage,
}: {
  label: string;
  used: number;
  limit: number;
  percentage: number;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: "#7d84a4", fontSize: 13 }}>
          {used} / {limit}
        </span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(percentage, 100)}%`,
            borderRadius: 999,
            background:
              percentage > 85
                ? "linear-gradient(135deg, #e24b4a, #ef9f27)"
                : "linear-gradient(135deg, #3b5ce4, #5b4af7)",
          }}
        />
      </div>
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

const inputStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#eef0ff",
  padding: "12px 14px",
  fontSize: 14,
};

const highlightCardStyle: React.CSSProperties = {
  borderColor: "rgba(79,110,247,0.25)",
  boxShadow: "0 0 0 1px rgba(79,110,247,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
};
