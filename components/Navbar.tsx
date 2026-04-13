"use client";

import { usePathname } from "next/navigation";

const PAGE_META: Array<{ match: RegExp; title: string; subtitle: string }> = [
  {
    match: /^\/dashboard$/,
    title: "Dashboard",
    subtitle: "Live overview of monitor health, incidents, and endpoint activity.",
  },
  {
    match: /^\/dashboard\/apis/,
    title: "Monitors",
    subtitle: "Manage monitor lifecycle, filters, and quick actions.",
  },
  {
    match: /^\/dashboard\/add-api$/,
    title: "Create Monitor",
    subtitle: "Add a new monitor using the current backend payload.",
  },
  {
    match: /^\/dashboard\/api\/\d+/,
    title: "Monitor Detail",
    subtitle: "Inspect configuration, analytics, logs, and edit controls.",
  },
  {
    match: /^\/dashboard\/subscription$/,
    title: "Subscription",
    subtitle: "Plans, billing history, usage, settings, and lifecycle actions.",
  },
  {
    match: /^\/dashboard\/account$/,
    title: "Account",
    subtitle: "Profile, current subscription summary, and account controls.",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const pageMeta = PAGE_META.find((item) => item.match.test(pathname)) || PAGE_META[0];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        padding: "16px 28px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(10,12,18,0.92)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div>
        <div style={{ color: "#eef0ff", fontSize: 16, fontWeight: 700 }}>{pageMeta.title}</div>
        <div style={{ color: "#7d84a4", fontSize: 12, marginTop: 4 }}>{pageMeta.subtitle}</div>
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 12px",
          borderRadius: 999,
          border: "1px solid rgba(29,158,117,0.22)",
          background: "rgba(29,158,117,0.1)",
          color: "#67d9b4",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#1d9e75",
            boxShadow: "0 0 8px #1d9e75",
          }}
        />
        App connected
      </div>
    </header>
  );
}
