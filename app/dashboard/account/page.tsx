"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userAPI } from "@/lib/api";
import type { UpdateProfileRequest, UserProfile, UserSubscriptionSummary } from "@/types";
import {
  ActionButton,
  Card,
  DashboardPage,
  LoadingBlock,
  Notice,
} from "@/components/dashboard/ui";
import { formatDateTime } from "@/lib/format";
import { extractApiError } from "@/lib/api/utils";
import { logout, updateStoredUser } from "@/lib/auth";

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscriptionSummary | null>(null);
  const [form, setForm] = useState<UpdateProfileRequest>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function loadAccount() {
      setLoading(true);
      setError("");

      try {
        const [profileResponse, subscriptionResponse] = await Promise.all([
          userAPI.getUserProfile(),
          userAPI.getUserSubscription(),
        ]);

        setProfile(profileResponse);
        setSubscription(subscriptionResponse);
        setForm({
          name: profileResponse.name || "",
          phone: profileResponse.phone || "",
          company: profileResponse.company || "",
        });
      } catch (loadError) {
        setError(extractApiError(loadError, "Unable to load account details."));
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const updated = await userAPI.updateUserProfile(form);
      setProfile(updated);
      updateStoredUser({
        id: updated.id,
        email: updated.email,
        name: updated.name,
      });
      setNotice("Profile updated successfully.");
    } catch (saveError) {
      setError(extractApiError(saveError, "Unable to update profile."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Delete your account? This removes your monitors and account data."
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await userAPI.deleteAccount();
      logout();
    } catch (deleteError) {
      setError(extractApiError(deleteError, "Unable to delete account."));
      setDeleting(false);
    }
  }

  return (
    <DashboardPage
      eyebrow="Account"
      title="Profile and account settings"
      subtitle="Update your profile, review your current subscription summary, and manage your account lifecycle."
      actions={
        <>
          <ActionButton tone="ghost" onClick={() => router.push("/dashboard/subscription")}>
            Open subscription
          </ActionButton>
        </>
      }
    >
      {error ? <Notice tone="error">{error}</Notice> : null}
      {notice ? <Notice tone="success">{notice}</Notice> : null}

      {loading ? (
        <LoadingBlock label="Loading account..." />
      ) : profile ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
            gap: 16,
          }}
        >
          <Card title="Profile" subtitle="These fields are backed by `GET/PUT /api/v1/user/profile`.">
            <div style={{ display: "grid", gap: 16 }}>
              <label style={labelStyle}>
                <span>Name</span>
                <input
                  value={String(form.name ?? "")}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                <span>Email</span>
                <input value={profile.email} disabled style={{ ...inputStyle, opacity: 0.75 }} />
              </label>
              <label style={labelStyle}>
                <span>Company</span>
                <input
                  value={String(form.company ?? "")}
                  onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                <span>Phone</span>
                <input
                  value={String(form.phone ?? "")}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  style={inputStyle}
                />
              </label>
              <ActionButton onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save profile"}
              </ActionButton>
            </div>
          </Card>

          <div style={{ display: "grid", gap: 16 }}>
            <Card title="Account summary" subtitle="Read-only values returned by the profile and subscription endpoints.">
              <SummaryRow label="Status" value={profile.is_active ? "Active" : "Inactive"} />
              <SummaryRow label="Subscription status" value={subscription?.status || profile.subscription_status} />
              <SummaryRow label="Subscription plan" value={subscription?.plan || "Unknown"} />
              <SummaryRow label="Email verified" value={profile.verified_email ? "Yes" : "No"} />
              <SummaryRow label="Joined" value={formatDateTime(profile.created_at)} />
              <SummaryRow label="Last login" value={formatDateTime(profile.last_login_at)} />
            </Card>

            <Card title="Danger zone" subtitle="Deleting your account also deletes your monitors and associated logs.">
              <ActionButton tone="danger" disabled={deleting} onClick={handleDeleteAccount}>
                {deleting ? "Deleting..." : "Delete account"}
              </ActionButton>
            </Card>
          </div>
        </div>
      ) : null}
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
