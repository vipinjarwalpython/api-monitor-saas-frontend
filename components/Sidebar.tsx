"use client";

import { useEffect, useState, useRef } from "react";
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

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.2" />
    <path d="M2 13c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconSubscription = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconSignOut = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
  >
    <path d="M5 10l3-3 3 3" stroke="#7d84a4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    userAPI.getUserProfile().then(setProfile).catch(() => undefined);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        avatarBtnRef.current &&
        !avatarBtnRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : profile?.email
    ? profile.email[0].toUpperCase()
    : "?";

  const navigate = (path: string) => {
    setPopoverOpen(false);
    router.push(path);
  };

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
      {/* Brand */}
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

      {/* Nav */}
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
                border: active ? "1px solid rgba(79,110,247,0.3)" : "1px solid transparent",
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

      {/* Profile area */}
      <div style={{ marginTop: "auto", position: "relative" }}>

        {/* Popover */}
        {popoverOpen && (
          <div
            ref={popoverRef}
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: 0,
              width: "100%",
              background: "#0f1120",
              border: "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: 14,
              zIndex: 50,
            }}
          >
            {/* Profile info */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b5ce4, #5b4af7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#eef0ff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {profile?.name || "Account"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#6ee7a0" }}>Active</span>
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#4b5280",
                marginBottom: 10,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {profile?.email || "—"}
            </div>

            <hr style={{ border: "none", borderTop: "0.5px solid rgba(255,255,255,0.06)", margin: "6px 0" }} />

            {/* Menu items */}
            {[
              { label: "Account", icon: <IconUser />, path: "/dashboard/account" },
              { label: "Subscription", icon: <IconSubscription />, path: "/dashboard/subscription" },
              { label: "Settings", icon: <IconSettings />, path: "/dashboard/settings" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "#8e95b5",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "9px 10px",
                  borderRadius: 10,
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontFamily: "inherit",
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#eef0ff";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "#8e95b5";
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <hr style={{ border: "none", borderTop: "0.5px solid rgba(255,255,255,0.06)", margin: "6px 0" }} />

            <button
              onClick={() => { setPopoverOpen(false); logout(); }}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: "#f2a09f",
                fontSize: 13,
                fontWeight: 600,
                padding: "9px 10px",
                borderRadius: 10,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "inherit",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(226,75,74,0.1)";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <IconSignOut />
              Sign out
            </button>
          </div>
        )}

        {/* Avatar trigger button */}
        <button
          ref={avatarBtnRef}
          onClick={() => setPopoverOpen((v) => !v)}
          style={{
            width: "100%",
            background: popoverOpen ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "10px 12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "inherit",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b5ce4, #5b4af7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0, textAlign: "left" }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: "#eef0ff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {profile?.name || profile?.email || "Account"}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#7d84a4",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {profile?.email || "Manage your settings"}
            </div>
          </div>
          <div style={{ marginLeft: "auto", flexShrink: 0 }}>
            <IconChevron open={popoverOpen} />
          </div>
        </button>
      </div>
    </aside>
  );
}