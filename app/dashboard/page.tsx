"use client";

import { useEffect, useState } from "react";
import { userAPI, monitorAPI } from "@/lib/api";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────
interface DashboardData {
  total_apis: number;
  uptime_percent: number;
  avg_response_time: number;
  apis?: ApiItem[];
}

interface ApiItem {
  id: string;
  name: string;
  url: string;
  status: "up" | "down" | "degraded";
  uptime: number;
  response_time: number;
  last_checked: string;
}

// ─── Stat Card ───────────────────────────────────────────────
function StatCard({
  title,
  value,
  sub,
  accent,
  icon,
  delay = 0,
}: {
  title: string;
  value: string | number;
  sub?: string;
  accent: string;
  icon: React.ReactNode;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <>
      <style>{`
        .stat-card {
          position: relative;
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 24px 26px;
          backdrop-filter: blur(20px);
          overflow: hidden;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.5s ease, transform 0.5s ease, border-color 0.2s, box-shadow 0.2s;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .stat-card.visible { opacity: 1; transform: translateY(0); }
        .stat-card:hover {
          border-color: rgba(255,255,255,0.12);
          box-shadow: 0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07);
        }
        .stat-card-glow {
          position: absolute;
          top: -40px; right: -40px;
          width: 120px; height: 120px;
          border-radius: 50%;
          opacity: 0.12;
          filter: blur(40px);
          pointer-events: none;
        }
        .stat-icon-wrap {
          width: 40px; height: 40px;
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
        }
        .stat-label {
          font-size: 11px;
          font-weight: 500;
          color: #555e80;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 600;
          color: #eef0ff;
          letter-spacing: -0.02em;
          line-height: 1;
          margin-bottom: 6px;
        }
        .stat-sub {
          font-size: 12px;
          font-weight: 300;
          color: #3a3e56;
        }
      `}</style>
      <div className={`stat-card ${visible ? "visible" : ""}`}>
        <div className="stat-card-glow" style={{ background: accent }} />
        <div className="stat-icon-wrap" style={{ background: `${accent}22`, border: `1px solid ${accent}33` }}>
          {icon}
        </div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </>
  );
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: "up" | "down" | "degraded" }) {
  const map = {
    up: { color: "#1d9e75", bg: "rgba(29,158,117,0.12)", border: "rgba(29,158,117,0.28)", label: "Operational" },
    down: { color: "#e24b4a", bg: "rgba(226,75,74,0.12)", border: "rgba(226,75,74,0.28)", label: "Down" },
    degraded: { color: "#ef9f27", bg: "rgba(239,159,39,0.12)", border: "rgba(239,159,39,0.28)", label: "Degraded" },
  };
  const s = map[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 100,
      background: s.bg, border: `1px solid ${s.border}`,
      fontSize: 11, fontWeight: 500, color: s.color,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: s.color,
        boxShadow: status === "up" ? `0 0 6px ${s.color}` : "none",
        animation: status === "up" ? "pulse-status 2s ease-in-out infinite" : "none",
      }} />
      {s.label}
    </span>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────
function Skeleton({ w = "100%", h = 20, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
    }} />
  );
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [apis, setApis] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [apisLoading, setApisLoading] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const fetchDashboardData = () => {
    // Fetch dashboard stats
    return userAPI.getUserStats()
      .then((res) => {
        console.log("Stats response:", res);
        setData({
          total_apis: res.total_monitors || 0,
          uptime_percent: res.average_uptime || 0,
          avg_response_time: 0, // Not provided in stats endpoint
        });
      })
      .catch((err) => {
        console.error("Error fetching stats:", err);
        setData({ total_apis: 0, uptime_percent: 0, avg_response_time: 0 });
      });
  };

  const fetchApis = () => {
    // Fetch actual APIs for the table
    return monitorAPI.getMyAPIs()
      .then((res) => {
        console.log("My APIs response:", res);
        setApis(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error("Error fetching APIs:", err);
        setApis([]);
      });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.all([
      userAPI.getUserStats()
        .then((res) => setData({
          total_apis: res.total_monitors,
          uptime_percent: res.average_uptime,
          avg_response_time: 0,
        }))
        .catch((err) => console.log("Error:", err)),
      monitorAPI.getMyAPIs()
        .then((res) => setApis(res || []))
        .catch((err) => {
          console.log("Error:", err);
          setApis([]);
        })
    ]).finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 80);
    
    setLoading(true);
    setApisLoading(true);
    Promise.all([
      fetchDashboardData(),
      fetchApis()
    ]).finally(() => {
      setLoading(false);
      setApisLoading(false);
    });

    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .dash-root {
          background: #0a0c12;
          font-family: 'DM Sans', sans-serif;
          color: #eef0ff;
          position: relative;
          overflow-x: hidden;
          padding: 0 36px 48px;
        }

        /* Background orbs */
        .bg-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.1;
          pointer-events: none;
          animation: orb-float 14s ease-in-out infinite;
        }
        .bg-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #4f6ef7, #1a2a8a); top: -200px; right: -100px; animation-delay: 0s; }
        .bg-orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, #7b6af7, #3b0764); bottom: -100px; left: -80px; animation-delay: 5s; }
        @keyframes orb-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-30px)} }

        .grid-overlay {
          position: fixed; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* Top bar */
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px 0 32px;
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .topbar.visible { opacity: 1; transform: translateY(0); }

        .topbar-left {}
        .page-eyebrow {
          font-size: 11px; font-weight: 500;
          color: #4f6ef7;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }
        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px; font-weight: 600;
          color: #eef0ff;
          letter-spacing: -0.02em;
        }
        .page-date {
          font-size: 12px; font-weight: 300;
          color: #464e6a;
          margin-top: 2px;
        }

        .topbar-actions { display: flex; align-items: center; gap: 10px; }

        .btn-ghost {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 400;
          color: #8890b0;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.07); color: #c0c4e4; border-color: rgba(255,255,255,0.12); }

        .btn-primary {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px;
          background: linear-gradient(135deg, #3b5ce4, #5b4af7);
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          color: #fff;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(59,92,228,0.35);
          position: relative; overflow: hidden;
        }
        .btn-primary::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(59,92,228,0.45); }
        .btn-primary:active { transform: scale(0.99); }

        /* Stat grid */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        /* Section header */
        .section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px;
        }
        .section-title {
          font-size: 14px; font-weight: 500;
          color: #c0c4e4;
          letter-spacing: -0.01em;
        }
        .section-count {
          font-size: 11px; font-weight: 400;
          color: #464e6a;
        }

        /* API Table */
        .api-table-wrap {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          overflow: hidden;
          backdrop-filter: blur(16px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s;
        }
        .api-table-wrap.visible { opacity: 1; transform: translateY(0); }

        .table-header-row {
          display: grid;
          grid-template-columns: 2.5fr 1fr 1.2fr 1fr 1.2fr;
          padding: 14px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.015);
          position: sticky;
          top: 0;
        }
        .th {
          font-size: 10px; font-weight: 500;
          color: #363a52;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .api-row {
          display: grid;
          grid-template-columns: 2.5fr 1fr 1.2fr 1fr 1.2fr;
          padding: 16px 22px;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
          cursor: pointer;
        }
        .api-row:last-child { border-bottom: none; }
        .api-row:hover { background: rgba(255,255,255,0.025); }

        .api-name {
          font-size: 13px; font-weight: 500;
          color: #d0d4f0;
          margin-bottom: 2px;
        }
        .api-url {
          font-size: 11px; font-weight: 300;
          color: #363a52;
          font-family: 'DM Mono', monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
        }

        .td {
          font-size: 13px; font-weight: 400;
          color: #8890b0;
        }
        .td-good { color: #1d9e75; }
        .td-warn { color: #ef9f27; }
        .td-bad { color: #e24b4a; }

        .uptime-bar-wrap {
          display: flex; align-items: center; gap: 8px;
        }
        .uptime-bar-bg {
          flex: 1; height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 4px;
          overflow: hidden;
          max-width: 80px;
        }
        .uptime-bar-fill {
          height: 100%; border-radius: 4px;
          transition: width 1s ease;
        }

        /* Empty state */
        .empty-state {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center;
          padding: 80px 40px;
          text-align: center;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          border-style: dashed;
        }
        .empty-icon {
          width: 56px; height: 56px;
          background: rgba(79,110,247,0.1);
          border: 1px solid rgba(79,110,247,0.2);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 600;
          color: #c0c4e4;
          margin-bottom: 8px;
        }
        .empty-desc {
          font-size: 13px; font-weight: 300;
          color: #464e6a;
          max-width: 280px;
          line-height: 1.7;
          margin-bottom: 28px;
        }

        /* Loading skeletons */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .btn-danger {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 16px;
          background: rgba(226,75,74,0.1);
          border: 1px solid rgba(226,75,74,0.22);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          color: #e87878;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
        }
        .btn-danger:hover { background: rgba(226,75,74,0.18); border-color: rgba(226,75,74,0.4); color: #f09595; }

        /* Status pill in topbar */
        .status-pill {
          display: flex; align-items: center; gap: 6px;
          background: rgba(29,158,117,0.1);
          border: 1px solid rgba(29,158,117,0.22);
          border-radius: 100px;
          padding: 5px 12px 5px 8px;
        }
        .status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #1d9e75; box-shadow: 0 0 6px #1d9e75;
          animation: pulse-status 2.5s ease-in-out infinite;
        }
        .status-text { font-size: 11px; font-weight: 500; color: #3dcaa0; }

        /* Notification dot */
        .notif-btn { position: relative; }
        .notif-dot {
          position: absolute;
          top: 7px; right: 7px;
          width: 7px; height: 7px;
          background: #e24b4a;
          border-radius: 50%;
          border: 1.5px solid #0a0c12;
          box-shadow: 0 0 6px #e24b4a;
        }

        /* Trend chip */
        .trend-chip {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 10px; font-weight: 500;
          padding: 2px 7px;
          border-radius: 100px;
        }
        .trend-up { background: rgba(29,158,117,0.12); color: #1d9e75; }
        .trend-down { background: rgba(226,75,74,0.12); color: #e24b4a; }

        /* Refresh animation */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 900px) {
          .dash-root { padding: 0 20px 48px; }
          .stat-grid { grid-template-columns: 1fr; }
          .table-header-row, .api-row { grid-template-columns: 2fr 1fr 1fr; }
          .table-header-row .th:nth-child(3),
          .table-header-row .th:nth-child(4),
          .api-row .td:nth-child(2),
          .api-row > div:nth-child(2),
          .api-row > div:nth-child(3),
          .api-row > div:nth-child(4) { display: none; }
        }
      `}</style>

      <div className="dash-root">
        <div className="grid-overlay" />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />

        {/* Top bar */}
        <div className={`topbar ${headerVisible ? "visible" : ""}`}>
            <div className="topbar-left">
              <div className="page-eyebrow">Overview</div>
              <h1 className="page-title">Dashboard</h1>
              <div className="page-date">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
            </div>
            <div className="topbar-actions">
              <div className="status-pill">
                <div className="status-dot" />
                <span className="status-text">All systems operational</span>
              </div>
              <button className="btn-ghost notif-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <div className="notif-dot" />
              </button>
              <button className="btn-ghost" onClick={handleRefresh} disabled={isRefreshing} style={{ opacity: isRefreshing ? 0.6 : 1 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }}>
                  <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
              <button className="btn-primary" onClick={() => router.push("/dashboard/add-api")}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add API
              </button>
            </div>
          </div>

          {/* ── STAT CARDS ── */}
          {loading ? (
            <div className="stat-grid">
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "24px 26px" }}>
                  <Skeleton w={36} h={36} r={11} />
                  <div style={{ marginTop: 18, marginBottom: 8 }}><Skeleton w="50%" h={10} r={5} /></div>
                  <Skeleton w="60%" h={32} r={8} />
                  <div style={{ marginTop: 8 }}><Skeleton w="40%" h={10} r={5} /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="stat-grid">
              <StatCard
                title="Total APIs"
                value={data?.total_apis ?? 4}
                sub="Across all workspaces"
                accent="#4f6ef7"
                delay={100}
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>}
              />
              <StatCard
                title="Uptime"
                value={`${data?.uptime_percent ?? 99.2}%`}
                sub={<span className="trend-chip trend-up">↑ 0.3% this week</span> as any}
                accent="#1d9e75"
                delay={200}
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d9e75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
              />
              <StatCard
                title="Avg Response"
                value={`${data?.avg_response_time ?? 271} ms`}
                sub={<span className="trend-chip trend-down">↑ 12ms vs yesterday</span> as any}
                accent="#ef9f27"
                delay={300}
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef9f27" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              />
            </div>
          )}

          {/* ── API TABLE ── */}
          {!loading && (data?.total_apis === 0) ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                </svg>
              </div>
              <div className="empty-title">No APIs yet</div>
              <p className="empty-desc">Add your first API endpoint to start monitoring uptime, response times, and performance.</p>
              <button className="btn-primary" onClick={() => router.push("/dashboard/add-api")} style={{ padding: "11px 24px", fontSize: 14 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Your First API
              </button>
            </div>
          ) : !loading && (
            <ApiTable apis={apis} apisLoading={apisLoading} onRowClick={(id) => router.push(`/dashboard/api/${id}`)} />
          )}

      </div>
    </>
  );
}

// ─── API Table Component ──────────────────────────────────────
function ApiTable({ apis, apisLoading, onRowClick }: { 
  apis: any[]; 
  apisLoading: boolean;
  onRowClick: (id: string | number) => void;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 350); return () => clearTimeout(t); }, []);

  const getStatusFromCode = (status?: string): "up" | "down" | "degraded" => {
    if (!status) return "down";
    const s = status.toUpperCase();
    if (s === "UP") return "up";
    if (s === "DOWN") return "down";
    return "degraded";
  };

  const formatCheckedTime = (timestamp?: string): string => {
    if (!timestamp) return "—";
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (seconds < 60) return `${seconds}s ago`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      return date.toLocaleDateString();
    } catch {
      return timestamp;
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#c0c4e4", letterSpacing: "-0.01em" }}>
          Monitored Endpoints
        </span>
        <span style={{ fontSize: 11, fontWeight: 400, color: "#464e6a" }}>
          {apis.length} endpoint{apis.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className={`api-table-wrap ${visible ? "visible" : ""}`}>
        <div className="table-header-row">
          <span className="th">Endpoint</span>
          <span className="th">Status</span>
          <span className="th">Response</span>
          <span className="th">Uptime</span>
          <span className="th">Checked</span>
        </div>

        {apisLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="api-row" style={{ opacity: 0.6, cursor: "default" }}>
              <div>
                <div style={{ height: 16, background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 6, marginBottom: 6, width: "70%" }} />
                <div style={{ height: 12, background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 4, width: "80%", opacity: 0.6 }} />
              </div>
              <div style={{ height: 22, background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 100, width: 60 }} />
              <div style={{ height: 16, background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 4, width: "50%" }} />
              <div style={{ height: 16, background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 4, width: "60%" }} />
              <div style={{ height: 16, background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 4, width: "55%" }} />
            </div>
          ))
        ) : apis.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ color: "#464e6a", fontSize: 13 }}>No APIs added yet</div>
            <div style={{ color: "#2e3248", fontSize: 12, marginTop: 4 }}>Start by adding your first API to monitor</div>
          </div>
        ) : (
          apis.map((api: any) => {
            const status = getStatusFromCode(api.status);
            // Handle response_time which comes in seconds from API
            const rtValue = api.response_time;
            const rtMs = typeof rtValue === "number" && rtValue > 0 ? Math.round(rtValue * 1000) : null;
            const rtColor = !rtMs ? "#e24b4a" : rtMs > 500 ? "#ef9f27" : "#1d9e75";
            
            return (
              <div 
                key={api.id} 
                className="api-row" 
                onClick={() => onRowClick(api.id)}
              >
                <div>
                  <div className="api-name">{api.name || "Untitled API"}</div>
                  <div className="api-url">{api.url || "—"}</div>
                </div>
                <div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 100,
                    background: status === "up" ? "rgba(29,158,117,0.12)" : status === "down" ? "rgba(226,75,74,0.12)" : "rgba(239,159,39,0.12)",
                    border: status === "up" ? "1px solid rgba(29,158,117,0.28)" : status === "down" ? "1px solid rgba(226,75,74,0.28)" : "1px solid rgba(239,159,39,0.28)",
                    fontSize: 11, fontWeight: 500,
                    color: status === "up" ? "#1d9e75" : status === "down" ? "#e24b4a" : "#ef9f27",
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: status === "up" ? "#1d9e75" : status === "down" ? "#e24b4a" : "#ef9f27",
                      boxShadow: status === "up" ? "0 0 6px #1d9e75" : "none",
                    }} />
                    {api.status ? api.status.toUpperCase() : "—"}
                  </span>
                </div>
                <div className="td" style={{ color: rtColor, fontWeight: 500 }}>
                  {rtMs ? `${rtMs} ms` : "—"}
                </div>
                <div className="td" style={{ color: "#4f6ef7", fontWeight: 500 }}>—</div>
                <div className="td">{formatCheckedTime(api.last_checked_at || "")}</div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}