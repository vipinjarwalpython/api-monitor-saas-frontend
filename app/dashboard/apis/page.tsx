"use client";

import { useEffect, useState } from "react";
import { monitorAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

interface ApiItem {
  id: number;
  name?: string;
  url: string;
  status: string;
  last_response_time?: number;
  check_interval?: number;
}

const INTERVAL_PRESETS = [
  { label: "30s", value: 30 },
  { label: "1 min", value: 60 },
  { label: "5 min", value: 300 },
  { label: "15 min", value: 900 },
  { label: "30 min", value: 1800 },
  { label: "1 hr", value: 3600 },
];

export default function ApiList() {
  const [apis, setApis] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<ApiItem | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editInterval, setEditInterval] = useState(60);
  const [editCustom, setEditCustom] = useState("");
  const [editUseCustom, setEditUseCustom] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [urlValid, setUrlValid] = useState<boolean | null>(null);

  const router = useRouter();

  const fetchApis = async () => {
    try {
      const data = await monitorAPI.getMyAPIs();
      setApis(data || []);
    } catch (err) {
      console.log("Error fetching APIs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApis(); }, []);

  const handleDelete = async (id: number) => {
    setDeleteId(id);
    setTimeout(async () => {
      try {
        await monitorAPI.deleteMonitor(id);
        setDeleteId(null);
        fetchApis();
      } catch (err) {
        console.error("Delete error:", err);
        setDeleteId(null);
      }
    }, 300);
  };

  const openEdit = (item: ApiItem) => {
    setEditItem(item);
    setEditUrl(item.url);
    setEditInterval(item.check_interval ?? 60);
    setEditUseCustom(false);
    setEditCustom("");
    setEditError("");
    setEditSuccess("");
    setUrlValid(null);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setTimeout(() => setEditItem(null), 300);
  };

  const validateUrl = (val: string) => {
    try { new URL(val); setUrlValid(true); }
    catch { setUrlValid(val.length > 0 ? false : null); }
  };

  const handleEditUrlChange = (val: string) => {
    setEditUrl(val);
    validateUrl(val);
  };

  const getEditInterval = () => editUseCustom ? Number(editCustom) : editInterval;

  const handleEditSave = async () => {
    setEditError("");
    setEditSuccess("");
    if (!editUrl) { setEditError("URL is required."); return; }
    if (urlValid === false) { setEditError("Please enter a valid URL including https://"); return; }
    const iv = getEditInterval();
    if (!iv || iv < 10) { setEditError("Interval must be at least 10 seconds."); return; }
    try {
      setEditLoading(true);
      await monitorAPI.updateMonitor(editItem!.id, {
        url: editUrl,
        check_interval: iv,
      });
      setEditSuccess("Changes saved successfully!");
      setTimeout(() => {
        closeEdit();
        fetchApis();
      }, 1000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.details || err?.response?.data?.detail || "Failed to save changes.";
      setEditError(errorMsg);
    } finally {
      setEditLoading(false);
    }
  };

  const statusStyle = (status: string) => {
    if (status === "UP") return { bg: "rgba(29,158,117,0.12)", border: "rgba(29,158,117,0.25)", color: "#3dcaa0", dot: "#1d9e75" };
    if (status === "DOWN") return { bg: "rgba(226,75,74,0.12)", border: "rgba(226,75,74,0.25)", color: "#f09595", dot: "#e24b4a" };
    return { bg: "rgba(239,159,39,0.12)", border: "rgba(239,159,39,0.25)", color: "#f0b84a", dot: "#ef9f27" };
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

        .apis-root {
          padding: 32px;
          font-family: 'DM Sans', sans-serif;
          color: #e0e4ff;
          min-height: calc(100vh - 56px);
          background: #0a0c12;
          position: relative;
        }

        .orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.08; pointer-events: none; }
        .orb-1 { width: 400px; height: 400px; background: radial-gradient(circle,#4f6ef7,#1a2a8a); top: -80px; right: -60px; }
        .orb-2 { width: 300px; height: 300px; background: radial-gradient(circle,#8b5cf6,#3b0764); bottom: 60px; left: -60px; }

        /* PAGE HEADER */
        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 28px;
          position: relative; z-index: 1;
        }
        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px; font-weight: 600;
          color: #eef0ff; letter-spacing: -0.02em;
        }
        .page-count {
          font-size: 13px; font-weight: 300;
          color: #464e6a; margin-top: 4px;
        }
        .add-btn {
          display: flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg, #3b5ce4, #5b4af7);
          border: none; border-radius: 10px;
          padding: 9px 18px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(59,92,228,0.35);
          transition: transform 0.15s, box-shadow 0.2s;
          position: relative; overflow: hidden;
        }
        .add-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.1),transparent); }
        .add-btn:hover { transform: translateY(-1px); box-shadow: 0 7px 22px rgba(59,92,228,0.45); }

        /* TABLE CARD */
        .table-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          overflow: hidden;
          position: relative; z-index: 1;
        }

        .t-head {
          display: grid;
          grid-template-columns: 2.5fr 1.5fr 1fr 1fr 1.2fr;
          padding: 12px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }
        .th {
          font-size: 10px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #363a52;
        }

        .t-row {
          display: grid;
          grid-template-columns: 2.5fr 1.5fr 1fr 1fr 1.2fr;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          align-items: center;
          transition: background 0.15s;
        }
        .t-row:last-child { border-bottom: none; }
        .t-row:hover { background: rgba(255,255,255,0.02); }
        .t-row.deleting { opacity: 0.3; transition: opacity 0.3s; }

        .api-name {
          font-size: 13px; font-weight: 500;
          color: #c0c8e8; margin-bottom: 3px;
        }
        .api-url {
          font-size: 11px; font-weight: 300;
          color: #404460;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          max-width: 280px;
        }

        .badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 100px;
          font-size: 11px; font-weight: 500;
          border: 1px solid;
        }
        .badge-dot {
          width: 5px; height: 5px; border-radius: 50%;
        }

        .resp-time {
          font-size: 12px; font-weight: 400;
          color: #7880a0;
          font-variant-numeric: tabular-nums;
        }

        .interval-val {
          font-size: 12px; color: #464e6a;
          display: flex; align-items: center; gap: 5px;
        }

        .actions {
          display: flex; align-items: center; gap: 6px;
        }
        .action-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 10px; border-radius: 7px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 500;
          cursor: pointer; border: 1px solid;
          transition: all 0.15s;
        }
        .btn-view {
          background: rgba(79,110,247,0.08);
          border-color: rgba(79,110,247,0.2);
          color: #7b9cf5;
        }
        .btn-view:hover { background: rgba(79,110,247,0.15); border-color: rgba(79,110,247,0.4); color: #a5b8fa; }
        .btn-edit {
          background: rgba(139,92,246,0.08);
          border-color: rgba(139,92,246,0.2);
          color: #a78bfa;
        }
        .btn-edit:hover { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.4); color: #c4b5fd; }
        .btn-delete {
          background: rgba(226,75,74,0.07);
          border-color: rgba(226,75,74,0.18);
          color: #e87878;
        }
        .btn-delete:hover { background: rgba(226,75,74,0.15); border-color: rgba(226,75,74,0.38); color: #f09595; }

        /* EMPTY STATE */
        .empty {
          padding: 64px 24px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
        }
        .empty-icon {
          width: 52px; height: 52px;
          background: rgba(79,110,247,0.1);
          border: 1px solid rgba(79,110,247,0.2);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
        }
        .empty-title { font-size: 15px; font-weight: 500; color: #7880a0; }
        .empty-sub { font-size: 13px; font-weight: 300; color: #363a52; }

        /* LOADING SKELETON */
        .skeleton-row {
          display: grid;
          grid-template-columns: 2.5fr 1.5fr 1fr 1fr 1.2fr;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          align-items: center; gap: 12px;
        }
        .skel {
          height: 10px; border-radius: 5px;
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* EDIT MODAL OVERLAY */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100; padding: 24px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        .modal {
          width: 100%; max-width: 460px;
          background: #0e1018;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px;
          padding: 36px 34px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06);
          animation: slideUp 0.25s ease;
          position: relative;
        }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        .modal-close {
          position: absolute; top: 18px; right: 18px;
          width: 28px; height: 28px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #525878;
          transition: background 0.15s, color 0.15s;
        }
        .modal-close:hover { background: rgba(255,255,255,0.08); color: #c0c4e4; }

        .modal-eyebrow { font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #7b6af7; margin-bottom: 8px; }
        .modal-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; color: #eef0ff; margin-bottom: 4px; }
        .modal-sub { font-size: 12px; font-weight: 300; color: #464e6a; margin-bottom: 26px; }

        .alert { display:flex;align-items:flex-start;gap:8px;padding:9px 13px;border-radius:9px;font-size:12px;margin-bottom:16px;animation:slideIn 0.2s ease;line-height:1.5; }
        @keyframes slideIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        .alert-err { background:rgba(226,75,74,0.1);border:1px solid rgba(226,75,74,0.25);color:#f09595; }
        .alert-ok { background:rgba(29,158,117,0.1);border:1px solid rgba(29,158,117,0.28);color:#5dcaa5; }

        .field-group { margin-bottom: 16px; }
        .field-label { display:block;font-size:11px;font-weight:500;color:#7880a0;margin-bottom:6px;letter-spacing:0.04em;text-transform:uppercase; }
        .field-wrapper { position: relative; }
        .field-icon { position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#363a52;pointer-events:none; }
        .field-input {
          width:100%;padding:11px 14px 11px 38px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:10px;color:#e0e4ff;
          font-family:'DM Sans',sans-serif;font-size:14px;
          outline:none;transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;
          box-sizing:border-box;
        }
        .field-input::placeholder { color:#2e3148; }
        .field-input:focus { border-color:rgba(123,106,247,0.5);background:rgba(123,106,247,0.06);box-shadow:0 0 0 3px rgba(123,106,247,0.1); }
        .field-input.ok { border-color:rgba(29,158,117,0.4);background:rgba(29,158,117,0.04); }
        .field-input.err { border-color:rgba(226,75,74,0.4);background:rgba(226,75,74,0.04); }

        .preset-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:6px; }
        .preset-btn { padding:8px 4px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:8px;color:#7880a0;font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;transition:all 0.15s;text-align:center; }
        .preset-btn:hover { background:rgba(79,110,247,0.1);border-color:rgba(79,110,247,0.3);color:#a5b8fa; }
        .preset-btn.active { background:rgba(79,110,247,0.15);border-color:rgba(79,110,247,0.45);color:#a5b8fa;font-weight:500; }
        .custom-row { display:flex;align-items:center;gap:8px;margin-top:7px; }
        .custom-toggle { font-size:11px;color:#464e6a;cursor:pointer;background:none;border:none;padding:0;font-family:'DM Sans',sans-serif;transition:color 0.15s; }
        .custom-toggle:hover { color:#7b9cf5; }
        .custom-input { flex:1;padding:7px 11px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:8px;color:#e0e4ff;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;box-sizing:border-box;transition:border-color 0.2s; }
        .custom-input:focus { border-color:rgba(79,110,247,0.4); }
        .custom-unit { font-size:12px;color:#464e6a;white-space:nowrap; }

        .modal-divider { height:1px;background:rgba(255,255,255,0.06);margin:20px 0; }

        .modal-footer { display:flex;gap:10px;margin-top:24px; }
        .cancel-btn { flex:1;padding:11px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;color:#7880a0;font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;transition:all 0.15s; }
        .cancel-btn:hover { background:rgba(255,255,255,0.07);color:#c0c4e4; }
        .save-btn { flex:2;padding:11px;background:linear-gradient(135deg,#5b4af7,#7b6af7);border:none;border-radius:10px;color:#fff;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;box-shadow:0 4px 16px rgba(91,74,247,0.35);transition:transform 0.15s,box-shadow 0.2s,opacity 0.2s;position:relative;overflow:hidden; }
        .save-btn::before { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.1),transparent); }
        .save-btn:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 7px 22px rgba(91,74,247,0.45); }
        .save-btn:disabled { opacity:0.55;cursor:not-allowed; }

        .spinner { display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:7px; }
        @keyframes spin { to{transform:rotate(360deg)} }

        .section-title { font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.07em;color:#363a52;margin-bottom:12px; }
      `}</style>

      <div className="apis-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        {/* Header */}
        <div className="page-header">
          <div>
            <div className="page-title">My APIs</div>
            <div className="page-count">
              {loading ? "Loading…" : `${apis.length} endpoint${apis.length !== 1 ? "s" : ""} monitored`}
            </div>
          </div>
          <button className="add-btn" onClick={() => router.push("/dashboard/add-api")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add API
          </button>
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="t-head">
            <div className="th">Endpoint</div>
            <div className="th">Status</div>
            <div className="th">Response</div>
            <div className="th">Interval</div>
            <div className="th">Actions</div>
          </div>

          {loading ? (
            [1, 2, 3].map((i) => (
              <div className="skeleton-row" key={i}>
                <div><div className="skel" style={{ width: "60%", marginBottom: 6 }} /><div className="skel" style={{ width: "80%" }} /></div>
                <div className="skel" style={{ width: 60 }} />
                <div className="skel" style={{ width: 50 }} />
                <div className="skel" style={{ width: 50 }} />
                <div className="skel" style={{ width: 100 }} />
              </div>
            ))
          ) : (
            <>
              {apis.map((item) => {
                const s = statusStyle(item.status);
                return (
                  <div key={item.id} className={`t-row ${deleteId === item.id ? "deleting" : ""}`}>
                    <div>
                      <div className="api-name">{item.name || "—"}</div>
                      <div className="api-url">{item.url}</div>
                    </div>

                    <div>
                      <span className="badge" style={{ background: s.bg, borderColor: s.border, color: s.color }}>
                        <span className="badge-dot" style={{ background: s.dot, boxShadow: `0 0 5px ${s.dot}` }} />
                        {item.status}
                      </span>
                    </div>

                    <div className="resp-time">
                      {item.response_time != null ? `${item.response_time} ms` : "—"}
                    </div>

                    <div className="interval-val">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#464e6a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {item.check_interval != null ? `${item.check_interval}s` : "—"}
                    </div>

                    <div className="actions">
                      <button className="action-btn btn-view" onClick={() => router.push(`/dashboard/api/${item.id}`)}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        View
                      </button>
                      <button className="action-btn btn-edit" onClick={() => openEdit(item)}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button className="action-btn btn-delete" onClick={() => handleDelete(item.id)}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}

              {apis.length === 0 && (
                <div className="empty">
                  <div className="empty-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>
                  <div className="empty-title">No APIs monitored yet</div>
                  <div className="empty-sub">Add your first endpoint to start tracking uptime and response time.</div>
                  <button className="add-btn" style={{ marginTop: 4 }} onClick={() => router.push("/dashboard/add-api")}>
                    Add your first API
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editOpen && editItem && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}>
          <div className="modal">
            <button className="modal-close" onClick={closeEdit}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="modal-eyebrow">Edit monitor</div>
            <div className="modal-title">Update API</div>
            <div className="modal-sub">
              {editItem.name || editItem.url}
            </div>

            {editError && (
              <div className="alert alert-err">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {editError}
              </div>
            )}
            {editSuccess && (
              <div className="alert alert-ok">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {editSuccess}
              </div>
            )}

            {/* URL */}
            <div className="field-group">
              <label className="field-label">Endpoint URL</label>
              <div className="field-wrapper">
                <svg className="field-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <input
                  type="text"
                  className={`field-input ${urlValid === true ? "ok" : urlValid === false ? "err" : ""}`}
                  value={editUrl}
                  onChange={(e) => handleEditUrlChange(e.target.value)}
                  placeholder="https://api.example.com/health"
                />
              </div>
            </div>

            <div className="modal-divider" />

            {/* Interval */}
            <div className="field-group">
              <div className="section-title">Check interval</div>
              <div className="preset-grid">
                {INTERVAL_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    className={`preset-btn ${!editUseCustom && editInterval === p.value ? "active" : ""}`}
                    onClick={() => { setEditInterval(p.value); setEditUseCustom(false); }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="custom-row">
                <button className="custom-toggle" onClick={() => setEditUseCustom(!editUseCustom)}>
                  {editUseCustom ? "▾ Custom:" : "+ Custom interval"}
                </button>
                {editUseCustom && (
                  <>
                    <input
                      type="number"
                      className="custom-input"
                      placeholder="e.g. 120"
                      value={editCustom}
                      onChange={(e) => setEditCustom(e.target.value)}
                      min={10}
                    />
                    <span className="custom-unit">seconds</span>
                  </>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeEdit}>Cancel</button>
              <button className="save-btn" onClick={handleEditSave} disabled={editLoading}>
                {editLoading ? <><span className="spinner" />Saving…</> : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}