"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { userAPI } from "@/lib/api";
import type { UserProfile } from "@/types";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Monitors", path: "/dashboard/apis" },
  { label: "Add monitor", path: "/dashboard/add-api" },
  { label: "Subscription", path: "/dashboard/subscription" },
  { label: "Account", path: "/dashboard/account" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    userAPI.getUserProfile().then(setProfile).catch(() => undefined);
  }, []);

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 220,
        height: "100vh",
        background: "#07080f",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        padding: 16,
        gap: 16,
        zIndex: 40,
        fontFamily: "'DM Sans', var(--font-geist-sans), sans-serif",
      }}
    >
      <button
        onClick={() => router.push("/dashboard")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.03)",
          color: "#eef0ff",
          padding: 14,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            background: "linear-gradient(135deg, #3b5ce4, #5b4af7)",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
          }}
        >
          A
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>API Monitor</div>
          <div style={{ color: "#7d84a4", fontSize: 11 }}>Frontend synced to backend</div>
        </div>
      </button>

      <nav style={{ display: "grid", gap: 8 }}>
        {NAV_ITEMS.map((item) => {
          const active =
            item.path === "/dashboard"
              ? pathname === item.path
              : pathname === item.path || pathname.startsWith(`${item.path}/`);

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                borderRadius: 12,
                border: active
                  ? "1px solid rgba(79,110,247,0.3)"
                  : "1px solid transparent",
                background: active ? "rgba(79,110,247,0.12)" : "transparent",
                color: active ? "#eef0ff" : "#8e95b5",
                padding: "12px 14px",
                textAlign: "left",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", display: "grid", gap: 12 }}>
        <div
          style={{
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.03)",
            padding: 14,
          }}
        >
          <div style={{ fontSize: 12, color: "#7d84a4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Signed in
          </div>
          <div style={{ marginTop: 8, fontWeight: 700, color: "#eef0ff" }}>
            {profile?.name || profile?.email || "Account"}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: "#7d84a4" }}>
            {profile?.company || profile?.email || "Manage your settings"}
          </div>
          <button
            onClick={() => router.push("/dashboard/account")}
            style={{
              marginTop: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              color: "#d6dbf5",
              padding: "9px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Open account
          </button>
        </div>

        <button
          onClick={() => logout()}
          style={{
            borderRadius: 12,
            border: "1px solid rgba(226,75,74,0.2)",
            background: "rgba(226,75,74,0.1)",
            color: "#f2a09f",
            padding: "11px 14px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
