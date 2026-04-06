"use client";

import { useState } from "react";
import Stats from "./stats";
import Logs from "./logs";

export default function ApiDetailsPage() {
  const [tab, setTab] = useState("stats");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

        .details-root {
          padding: 32px;
          font-family: 'DM Sans', sans-serif;
          color: #e0e4ff;
          min-height: calc(100vh - 56px);
          background: #0a0c12;
          position: relative;
          overflow: hidden;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.08;
          pointer-events: none;
        }
        .orb-1 { width: 380px; height: 380px; background: radial-gradient(circle,#4f6ef7,#1a2a8a); top: -80px; right: -60px; }
        .orb-2 { width: 260px; height: 260px; background: radial-gradient(circle,#8b5cf6,#3b0764); bottom: 60px; left: -40px; }

        .page-header {
          margin-bottom: 28px;
          position: relative;
          z-index: 1;
        }
        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 600;
          color: #eef0ff;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .page-sub {
          font-size: 12px;
          font-weight: 300;
          color: #363a52;
        }

        .tab-bar {
          display: flex;
          gap: 4px;
          margin-bottom: 28px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 11px;
          padding: 4px;
          width: fit-content;
          position: relative;
          z-index: 1;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 20px;
          border-radius: 8px;
          border: none;
          background: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: #525878;
          cursor: pointer;
          transition: background 0.18s, color 0.18s;
        }
        .tab-btn:hover {
          color: #9098b8;
        }
        .tab-btn.active {
          background: rgba(255,255,255,0.07);
          color: #e0e4ff;
          font-weight: 500;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .tab-content {
          position: relative;
          z-index: 1;
        }
      `}</style>

      <div className="details-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="page-header">
          <div className="page-title">API Details</div>
          <div className="page-sub">Monitor stats, uptime history and check logs</div>
        </div>

        <div className="tab-bar">
          <button
            className={`tab-btn ${tab === "stats" ? "active" : ""}`}
            onClick={() => setTab("stats")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Stats
          </button>

          <button
            className={`tab-btn ${tab === "logs" ? "active" : ""}`}
            onClick={() => setTab("logs")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Logs
          </button>
        </div>

        <div className="tab-content">
          {tab === "stats" ? <Stats /> : <Logs />}
        </div>
      </div>
    </>
  );
}