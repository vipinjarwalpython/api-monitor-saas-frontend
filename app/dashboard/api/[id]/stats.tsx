"use client";

import { useEffect, useState } from "react";
import { analyticsAPI } from "@/lib/api";
import { useParams } from "next/navigation";

export default function Stats() {
  const { id } = useParams();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const numId = parseInt(id as string, 10);
    analyticsAPI.getMonitorStats(numId)
      .then((res) => {
        console.log("Monitor stats:", res);
        setStats(res);
      })
      .catch((err) => {
        console.error("Error fetching stats:", err);
      });
  }, [id]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 16px;
          font-family: 'DM Sans', sans-serif;
        }
        @media (min-width: 640px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }

        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s, background 0.2s;
        }
        .stat-card:hover {
          background: rgba(255,255,255,0.045);
          border-color: rgba(255,255,255,0.09);
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
        }

        .stat-icon {
          width: 34px; height: 34px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
          flex-shrink: 0;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #464e6a;
          margin-bottom: 8px;
        }

        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .stat-bar-wrap {
          margin-top: 14px;
          height: 3px;
          border-radius: 3px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .stat-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.8s ease;
        }

        .stat-footer {
          margin-top: 10px;
          font-size: 11px;
          font-weight: 300;
          color: #363a52;
        }

        /* Skeleton */
        .skel-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
        }
        .skel {
          border-radius: 5px;
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* Uptime ring */
        .uptime-section {
          margin-top: 20px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.055);
          border-radius: 16px;
          padding: 22px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .uptime-label {
          font-size: 11px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.07em;
          color: #464e6a; margin-bottom: 6px;
        }
        .uptime-value {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 600;
          color: #3dcaa0; letter-spacing: -0.02em;
        }
        .uptime-sub { font-size: 11px; color: #363a52; margin-top: 4px; }
      `}</style>

      {!stats ? (
        <div className="stats-grid">
          {[1, 2, 3].map((i) => (
            <div className="skel-card" key={i}>
              <div className="skel" style={{ width: 34, height: 34, borderRadius: 9, marginBottom: 16 }} />
              <div className="skel" style={{ width: "50%", height: 10, marginBottom: 10 }} />
              <div className="skel" style={{ width: "30%", height: 32 }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {/* Total Checks */}
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(79,110,247,0.12)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div className="stat-label">Total Checks</div>
              <div className="stat-value" style={{ color: "#d0d8f8" }}>
                {stats?.total_checks ?? 0}
              </div>
              <div className="stat-bar-wrap">
                <div className="stat-bar" style={{ width: "100%", background: "linear-gradient(90deg,#4f6ef7,rgba(79,110,247,0.2))" }} />
              </div>
              <div className="stat-footer">All checks performed so far</div>
            </div>

            {/* Success */}
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(29,158,117,0.12)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d9e75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="stat-label">Successful</div>
              <div className="stat-value" style={{ color: "#3dcaa0" }}>
                {stats?.success_checks ?? 0}
              </div>
              <div className="stat-bar-wrap">
                <div
                  className="stat-bar"
                  style={{
                    width: (stats?.total_checks ?? 0) > 0 ? `${((stats?.success_checks ?? 0) / (stats?.total_checks ?? 1)) * 100}%` : "0%",
                    background: "linear-gradient(90deg,#1d9e75,rgba(29,158,117,0.2))"
                  }}
                />
              </div>
              <div className="stat-footer">
                {(stats?.total_checks ?? 0) > 0
                  ? `${(((stats?.success_checks ?? 0) / (stats?.total_checks ?? 1)) * 100).toFixed(1)}% success rate`
                  : "No checks yet"}
              </div>
            </div>

            {/* Failures */}
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(226,75,74,0.1)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e24b4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div className="stat-label">Failures</div>
              <div className="stat-value" style={{ color: (stats?.failure_checks ?? 0) > 0 ? "#f09595" : "#3dcaa0" }}>
                {stats?.failure_checks ?? 0}
              </div>
              <div className="stat-bar-wrap">
                <div
                  className="stat-bar"
                  style={{
                    width: (stats?.total_checks ?? 0) > 0 ? `${((stats?.failure_checks ?? 0) / (stats?.total_checks ?? 1)) * 100}%` : "0%",
                    background: "linear-gradient(90deg,#e24b4a,rgba(226,75,74,0.2))"
                  }}
                />
              </div>
              <div className="stat-footer">
                {(stats?.failure_checks ?? 0) === 0 ? "No failures recorded 🎉" : `${stats?.failure_checks} failed check${(stats?.failure_checks ?? 0) !== 1 ? "s" : ""}`}
              </div>
            </div>
          </div>

          {/* Uptime summary */}
          {(stats?.total_checks ?? 0) > 0 && (
            <div className="uptime-section">
              <div>
                <div className="uptime-label">Overall Uptime</div>
                <div className="uptime-value">
                  {(stats?.uptime_percent ?? 0).toFixed(2)}%
                </div>
                <div className="uptime-sub">Based on {stats?.total_checks} total checks</div>
              </div>
              <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"/>
                <circle
                  cx="26" cy="26" r="22"
                  fill="none"
                  stroke="#1d9e75"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - ((stats?.uptime_percent ?? 0) / 100))}`}
                  transform="rotate(-90 26 26)"
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
            </div>
          )}
        </>
      )}
    </>
  );
}