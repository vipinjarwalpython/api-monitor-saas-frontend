"use client";

import { logout } from "@/lib/auth";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  "/dashboard": { title: "Dashboard", sub: "Overview of all your monitored APIs" },
  "/dashboard/apis": { title: "My APIs", sub: "Manage and view your API monitors" },
  "/dashboard/add-api": { title: "Add API", sub: "Connect a new endpoint to monitor" },
};

export default function Navbar() {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname ?? ""] ?? { title: "Dashboard", sub: "" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

        .navbar {
          /* STICKY — part of document flow, sticks to top of scroll container */
          position: sticky;
          top: 0;
          /* NOT position: fixed — that's what caused the overlap */

          width: 100%;
          height: 56px;
          background: rgba(10, 12, 18, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.055);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          z-index: 40;
          font-family: 'DM Sans', sans-serif;
          flex-shrink: 0;
        }

        .navbar-left {}
        .navbar-title {
          font-size: 15px;
          font-weight: 500;
          color: #d0d4f0;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .navbar-sub {
          font-size: 11px;
          font-weight: 300;
          color: #363a58;
          margin-top: 1px;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(29,158,117,0.1);
          border: 1px solid rgba(29,158,117,0.2);
          border-radius: 100px;
          padding: 4px 12px 4px 8px;
        }
        .sp-dot {
          width: 6px; height: 6px;
          background: #1d9e75;
          border-radius: 50%;
          box-shadow: 0 0 6px #1d9e75;
          animation: spulse 2.5s ease-in-out infinite;
        }
        @keyframes spulse {
          0%,100% { box-shadow: 0 0 5px #1d9e75; opacity: 1; }
          50% { box-shadow: 0 0 10px #1d9e75; opacity: 0.65; }
        }
        .sp-text {
          font-size: 11px;
          font-weight: 500;
          color: #3dcaa0;
          letter-spacing: 0.02em;
        }

        .nav-sep {
          width: 1px;
          height: 18px;
          background: rgba(255,255,255,0.07);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          background: rgba(226,75,74,0.1);
          border: 1px solid rgba(226,75,74,0.2);
          border-radius: 9px;
          padding: 6px 14px;
          color: #e87878;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
        }
        .logout-btn:hover {
          background: rgba(226,75,74,0.18);
          border-color: rgba(226,75,74,0.38);
          color: #f09595;
        }
      `}</style>

      <header className="navbar">
        <div className="navbar-left">
          <div className="navbar-title">{page.title}</div>
          {page.sub && <div className="navbar-sub">{page.sub}</div>}
        </div>

        <div className="navbar-right">
          <div className="status-pill">
            <div className="sp-dot" />
            <span className="sp-text">All systems operational</span>
          </div>

          <div className="nav-sep" />

          <button className="logout-btn" onClick={logout}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </header>
    </>
  );
}