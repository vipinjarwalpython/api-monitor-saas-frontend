"use client";

import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    exact: true,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: "My APIs",
    path: "/dashboard/apis",
    exact: false,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string, exact: boolean) =>
    exact ? pathname === path : pathname === path || pathname?.startsWith(path + "/");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

        .sidebar {
          position: fixed;
          top: 0; left: 0;
          width: 220px;
          height: 100vh;
          background: #07080f;
          border-right: 1px solid rgba(255,255,255,0.055);
          display: flex;
          flex-direction: column;
          z-index: 50;
          font-family: 'DM Sans', sans-serif;
        }

        .sb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          flex-shrink: 0;
        }
        .sb-icon {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, #3b5ce4, #5b4af7);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(59,92,228,0.4);
        }
        .sb-name {
          font-size: 14px; font-weight: 500;
          color: #e0e4ff; letter-spacing: -0.01em;
        }
        .sb-live {
          margin-left: auto;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #1d9e75;
          box-shadow: 0 0 6px #1d9e75;
          animation: lb 2.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes lb {
          0%,100% { box-shadow: 0 0 5px #1d9e75; opacity: 1; }
          50% { box-shadow: 0 0 12px #1d9e75; opacity: 0.6; }
        }

        .sb-nav {
          flex: 1;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          gap: 1px;
          overflow-y: auto;
        }
        .sb-sec {
          font-size: 10px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #2e3248;
          padding: 9px 8px 5px;
        }

        .sb-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px;
          border-radius: 9px;
          border: none; background: none;
          color: #525878;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 400;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          text-align: left; width: 100%;
          position: relative;
        }
        .sb-item:hover { background: rgba(255,255,255,0.04); color: #b0b8d8; }
        .sb-item.active { background: rgba(79,110,247,0.11); color: #a5b8fa; }
        .sb-item.active .sb-icon-wrap { color: #4f6ef7; }
        .sb-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 22%; bottom: 22%;
          width: 2px;
          background: #4f6ef7;
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 7px rgba(79,110,247,0.7);
        }
        .sb-icon-wrap {
          color: #404460; flex-shrink: 0;
          display: flex; align-items: center;
          transition: color 0.15s;
        }
        .sb-item:hover .sb-icon-wrap { color: #6a7aaa; }

        .sb-add {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px;
          border-radius: 9px;
          border: 1px dashed rgba(79,110,247,0.22);
          background: none;
          color: #404060;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.18s;
          text-align: left; width: 100%;
          margin-top: 4px;
        }
        .sb-add:hover {
          border-color: rgba(79,110,247,0.45);
          background: rgba(79,110,247,0.07);
          color: #7b9cf5;
        }
        .sb-add:hover .sb-icon-wrap { color: #7b9cf5; }

        .sb-footer {
          padding: 10px 8px 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
        }
        .sb-user {
          display: flex; align-items: center; gap: 9px;
          padding: 7px 10px; border-radius: 9px;
        }
        .sb-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #3b5ce4, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 500; color: #fff;
          flex-shrink: 0;
        }
        .sb-uname { font-size: 12px; font-weight: 500; color: #70788a; }
        .sb-ustatus {
          font-size: 10px; color: #2e3248;
          display: flex; align-items: center; gap: 4px; margin-top: 1px;
        }
        .sb-ugreen { width: 5px; height: 5px; background: #1d9e75; border-radius: 50%; }
      `}</style>

      <aside className="sidebar">
        <div className="sb-logo" onClick={() => router.push("/dashboard")}>
          <div className="sb-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <span className="sb-name">API Monitor</span>
          <div className="sb-live" />
        </div>

        <nav className="sb-nav">
          <span className="sb-sec">Overview</span>

          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              className={`sb-item ${isActive(item.path, item.exact) ? "active" : ""}`}
              onClick={() => router.push(item.path)}
            >
              <span className="sb-icon-wrap">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <span className="sb-sec">Actions</span>

          <button className="sb-add" onClick={() => router.push("/dashboard/add-api")}>
            <span className="sb-icon-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </span>
            Add new API
          </button>
        </nav>

        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">U</div>
            <div>
              <div className="sb-uname">My Account</div>
              <div className="sb-ustatus">
                <div className="sb-ugreen" />
                Online
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}