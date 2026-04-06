"use client";

import { useRouter, usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { useState, useEffect } from "react";
import api from "@/lib/axios";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
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
    ],
  },
  {
    label: "Actions",
    items: [
      {
        label: "Add new API",
        path: "/dashboard/add-api",
        exact: true,
        dashed: true,
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError("");
      const res = await api.get("/user/profile");
      setProfile(res.data);
    } catch (err: any) {
      setProfileError(err?.response?.data?.detail || "Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileClick = () => {
    setProfileOpen(true);
    if (!profile) fetchProfile();
  };

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
          overflow-x: hidden;
          overflow-y: auto;
        }

        /* LOGO */
        .sb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          flex-shrink: 0;
        }
        .sb-logo-icon {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, #3b5ce4, #5b4af7);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(59,92,228,0.4);
        }
        .sb-logo-name {
          font-size: 14px; font-weight: 500;
          color: #e0e4ff; letter-spacing: -0.01em;
        }
        .sb-live {
          margin-left: auto;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #1d9e75;
          box-shadow: 0 0 6px #1d9e75;
          animation: lbpulse 2.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes lbpulse {
          0%,100% { box-shadow: 0 0 5px #1d9e75; opacity: 1; }
          50% { box-shadow: 0 0 12px #1d9e75; opacity: 0.6; }
        }

        /* NAV */
        .sb-nav {
          flex: 1;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          gap: 1px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .sb-section-label {
          font-size: 10px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #2e3248;
          padding: 9px 8px 5px;
        }

        /* Regular nav item */
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
        .sb-item:hover {
          background: rgba(255,255,255,0.04);
          color: #b0b8d8;
        }
        .sb-item.active {
          background: rgba(79,110,247,0.11);
          color: #a5b8fa;
        }
        .sb-item.active .sb-item-icon { color: #4f6ef7; }
        .sb-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 22%; bottom: 22%;
          width: 2px;
          background: #4f6ef7;
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 7px rgba(79,110,247,0.7);
        }
        .sb-item-icon {
          color: #404460; flex-shrink: 0;
          display: flex; align-items: center;
          transition: color 0.15s;
        }
        .sb-item:hover .sb-item-icon { color: #6a7aaa; }

        /* Dashed "add" item */
        .sb-item-dashed {
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
          margin-top: 2px;
        }
        .sb-item-dashed:hover {
          border-color: rgba(79,110,247,0.45);
          background: rgba(79,110,247,0.07);
          color: #7b9cf5;
        }
        .sb-item-dashed:hover .sb-item-icon { color: #7b9cf5; }
        .sb-item-dashed.active {
          border-color: rgba(79,110,247,0.5);
          background: rgba(79,110,247,0.12);
          color: #a5b8fa;
        }
        .sb-item-dashed.active .sb-item-icon { color: #4f6ef7; }

        /* FOOTER */
        .sb-footer {
          padding: 10px 8px 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sb-logout {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px;
          border-radius: 9px;
          border: none; background: none;
          color: #4a3040;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 400;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          text-align: left; width: 100%;
        }
        .sb-logout:hover {
          background: rgba(226,75,74,0.08);
          color: #e87878;
        }
        .sb-logout:hover .sb-item-icon { color: #e87878; }

        .sb-user {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 10px;
          border-radius: 9px;
          cursor: default;
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

        /* Profile Modal */
        .profile-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
        .profile-modal-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }

        .profile-modal {
          background: #07080f;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 28px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          transform: scale(0.9);
          transition: transform 0.2s ease;
        }
        .profile-modal-overlay.active .profile-modal {
          transform: scale(1);
        }

        .profile-modal-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .profile-modal-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b5ce4, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
          color: #fff;
          flex-shrink: 0;
        }
        .profile-modal-info h3 {
          font-size: 14px;
          font-weight: 600;
          color: #e0e4ff;
          margin: 0 0 4px 0;
        }
        .profile-modal-info p {
          font-size: 12px;
          color: #464e6a;
          margin: 0;
        }

        .profile-modal-content {
          margin-bottom: 20px;
        }
        .profile-field {
          margin-bottom: 16px;
        }
        .profile-label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #2e3248;
          margin-bottom: 6px;
          display: block;
        }
        .profile-value {
          font-size: 13px;
          color: #b0b8d8;
          word-break: break-all;
        }

        .profile-modal-footer {
          display: flex;
          gap: 10px;
        }
        .profile-btn {
          flex: 1;
          padding: 10px 16px;
          border-radius: 9px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .profile-btn-close {
          background: rgba(255, 255, 255, 0.04);
          color: #8890b0;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .profile-btn-close:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #c0c4e4;
        }

        .profile-loading {
          padding: 40px 20px;
          text-align: center;
          color: #464e6a;
          font-size: 13px;
        }
        .profile-error {
          padding: 24px 16px;
          background: rgba(226, 75, 74, 0.1);
          border: 1px solid rgba(226, 75, 74, 0.2);
          border-radius: 9px;
          color: #f09595;
          font-size: 12px;
        }
      `}</style>

      <aside className="sidebar">
        {/* Logo */}
        <div className="sb-logo" onClick={() => router.push("/dashboard")}>
          <div className="sb-logo-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <span className="sb-logo-name">API Monitor</span>
          <div className="sb-live" />
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <span className="sb-section-label">{section.label}</span>

              {section.items.map((item) => {
                const active = isActive(item.path, item.exact);

                if ((item as any).dashed) {
                  return (
                    <button
                      key={item.path}
                      className={`sb-item-dashed ${active ? "active" : ""}`}
                      onClick={() => router.push(item.path)}
                    >
                      <span className="sb-item-icon">{item.icon}</span>
                      {item.label}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.path}
                    className={`sb-item ${active ? "active" : ""}`}
                    onClick={() => router.push(item.path)}
                  >
                    <span className="sb-item-icon">{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sb-footer">
          <div className="sb-user" onClick={handleProfileClick} style={{ cursor: "pointer" }}>
            <div className="sb-avatar">U</div>
            <div>
              <div className="sb-uname">My Account</div>
              <div className="sb-ustatus">
                <div className="sb-ugreen" />
                Online
              </div>
            </div>
          </div>
          <button className="sb-logout" onClick={logout}>
            <span className="sb-item-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            Sign out
          </button>
        </div>

        {/* Profile Modal */}
        <div className={`profile-modal-overlay ${profileOpen ? "active" : ""}`} onClick={() => setProfileOpen(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            {profileLoading ? (
              <div className="profile-loading">Loading profile...</div>
            ) : profileError ? (
              <div className="profile-error">{profileError}</div>
            ) : profile ? (
              <>
                <div className="profile-modal-header">
                  <div className="profile-modal-avatar">
                    {profile.email ? profile.email[0].toUpperCase() : "U"}
                  </div>
                  <div className="profile-modal-info">
                    <h3>{profile.username || profile.email || "User"}</h3>
                    <p>{profile.email || "No email"}</p>
                  </div>
                </div>

                <div className="profile-modal-content">
                  {profile.user_id && (
                    <div className="profile-field">
                      <label className="profile-label">User ID</label>
                      <div className="profile-value">{profile.user_id}</div>
                    </div>
                  )}
                  {profile.username && (
                    <div className="profile-field">
                      <label className="profile-label">Username</label>
                      <div className="profile-value">{profile.username}</div>
                    </div>
                  )}
                  {profile.email && (
                    <div className="profile-field">
                      <label className="profile-label">Email</label>
                      <div className="profile-value">{profile.email}</div>
                    </div>
                  )}
                  {profile.created_at && (
                    <div className="profile-field">
                      <label className="profile-label">Member Since</label>
                      <div className="profile-value">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="profile-modal-footer">
                  <button className="profile-btn profile-btn-close" onClick={() => setProfileOpen(false)}>
                    Close
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}