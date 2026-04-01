"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

const INTERVAL_PRESETS = [
  { label: "30s", value: 30 },
  { label: "1 min", value: 60 },
  { label: "5 min", value: 300 },
  { label: "15 min", value: 900 },
  { label: "30 min", value: 1800 },
  { label: "1 hr", value: 3600 },
];

export default function AddApi() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState(60);
  const [customInterval, setCustomInterval] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [method, setMethod] = useState("GET");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const validateUrl = (val: string) => {
    try {
      new URL(val);
      setUrlValid(true);
    } catch {
      setUrlValid(val.length > 0 ? false : null);
    }
  };

  const handleUrlChange = (val: string) => {
    setUrl(val);
    validateUrl(val);
  };

  const getInterval = () => useCustom ? Number(customInterval) : interval;

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!name || !url) { setError("API name and URL are required."); return; }
    if (urlValid === false) { setError("Please enter a valid URL including https://"); return; }
    const iv = getInterval();
    if (!iv || iv < 10) { setError("Check interval must be at least 10 seconds."); return; }
    try {
      setLoading(true);
      await api.post("/monitor/add-api", { name, url, check_interval: iv, method });
      setSuccess("API added and monitoring started!");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to add API. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .addapi-root {
          min-height: 100vh;
          background: #0a0c12;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          animation: float 10s ease-in-out infinite;
          pointer-events: none;
        }
        .orb-1 { width:420px;height:420px;background:radial-gradient(circle,#4f6ef7,#1a2a8a);top:-100px;left:-80px;animation-delay:0s; }
        .orb-2 { width:320px;height:320px;background:radial-gradient(circle,#06b6d4,#0e4f6a);bottom:-60px;right:-60px;animation-delay:4s; }
        .orb-3 { width:240px;height:240px;background:radial-gradient(circle,#8b5cf6,#3b0764);top:50%;left:48%;animation-delay:8s; }

        @keyframes float {
          0%,100% { transform: translateY(0) scale(1); }
          33% { transform: translateY(-24px) scale(1.04); }
          66% { transform: translateY(16px) scale(0.97); }
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* Back button */
        .back-btn {
          position: fixed;
          top: 24px;
          left: 24px;
          display: flex;
          align-items: center;
          gap: 7px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px;
          padding: 7px 14px 7px 10px;
          color: #7880a0;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          z-index: 10;
        }
        .back-btn:hover { background: rgba(255,255,255,0.07); color: #c0c4e4; }

        .inner {
          width: 100%;
          max-width: 980px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 767px) {
          .inner { grid-template-columns: 1fr; }
          .left-col { display: none; }
        }

        /* LEFT */
        .left-col {}
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(79,110,247,0.12);
          border: 1px solid rgba(79,110,247,0.25);
          border-radius: 100px;
          padding: 6px 16px 6px 10px;
          margin-bottom: 36px;
          width: fit-content;
        }
        .badge-dot {
          width: 8px; height: 8px;
          background: #4f6ef7;
          border-radius: 50%;
          box-shadow: 0 0 8px #4f6ef7;
          animation: pdot 2s ease-in-out infinite;
        }
        @keyframes pdot { 0%,100%{box-shadow:0 0 8px #4f6ef7} 50%{box-shadow:0 0 16px #4f6ef7} }
        .badge-text { font-size: 11px; font-weight: 500; color: #7b9cf5; letter-spacing: 0.08em; text-transform: uppercase; }

        .left-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(30px, 3.2vw, 44px);
          font-weight: 700;
          color: #f0f2ff;
          line-height: 1.2;
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }
        .left-headline span {
          background: linear-gradient(135deg, #4f6ef7, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .left-desc {
          font-size: 14px;
          font-weight: 300;
          color: #7880a0;
          line-height: 1.78;
          max-width: 340px;
          margin: 0 0 40px;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 44px;
        }
        .feat-item {
          display: flex;
          align-items: center;
          gap: 13px;
        }
        .feat-icon {
          width: 34px; height: 34px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .feat-text { font-size: 13px; font-weight: 400; color: #9098b8; }

        .preview-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 18px 20px;
        }
        .preview-label {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #464e6a;
          margin-bottom: 14px;
        }
        .preview-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .preview-row:last-child { margin-bottom: 0; }
        .preview-key { font-size: 12px; color: #464e6a; }
        .preview-val {
          font-size: 12px;
          font-weight: 500;
          color: #c0c4e4;
          text-align: right;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .status-dot {
          display: inline-block;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #1d9e75;
          box-shadow: 0 0 6px #1d9e75;
          margin-right: 6px;
          animation: pdot 2s ease-in-out infinite;
        }

        /* RIGHT / CARD */
        .card {
          background: rgba(255,255,255,0.028);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 40px 38px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.025), 0 36px 72px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .card.mounted { opacity: 1; transform: translateY(0); }

        .card-eyebrow { font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #4f6ef7; margin-bottom: 10px; }
        .card-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 600; color: #eef0ff; margin: 0 0 4px; letter-spacing: -0.01em; }
        .card-subtitle { font-size: 13px; font-weight: 300; color: #55596e; margin: 0 0 28px; }

        .alert {
          display: flex; align-items: flex-start; gap: 9px;
          padding: 10px 13px; border-radius: 10px;
          font-size: 12px; font-weight: 400; margin-bottom: 18px; line-height: 1.5;
          animation: slideIn 0.25s ease;
        }
        @keyframes slideIn { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }
        .alert-error { background: rgba(226,75,74,0.1); border: 1px solid rgba(226,75,74,0.25); color: #f09595; }
        .alert-success { background: rgba(29,158,117,0.1); border: 1px solid rgba(29,158,117,0.28); color: #5dcaa5; }

        .field-group { margin-bottom: 16px; }
        .field-label { display: block; font-size: 11px; font-weight: 500; color: #7880a0; margin-bottom: 6px; letter-spacing: 0.04em; text-transform: uppercase; }
        .field-wrapper { position: relative; }
        .field-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #363a52; pointer-events: none; }
        .field-input {
          width: 100%; padding: 12px 14px 12px 40px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 11px; color: #e0e4ff;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: #2e3148; }
        .field-input:focus { border-color: rgba(79,110,247,0.5); background: rgba(79,110,247,0.06); box-shadow: 0 0 0 3px rgba(79,110,247,0.1); }
        .field-input.url-ok { border-color: rgba(29,158,117,0.4); background: rgba(29,158,117,0.04); }
        .field-input.url-err { border-color: rgba(226,75,74,0.45); background: rgba(226,75,74,0.04); }

        /* URL + method row */
        .url-row { display: flex; gap: 8px; }
        .method-select {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 11px;
          color: #a594f7;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          padding: 0 12px;
          outline: none;
          cursor: pointer;
          flex-shrink: 0;
          appearance: none;
          -webkit-appearance: none;
          text-align: center;
          min-width: 70px;
          transition: border-color 0.2s, background 0.2s;
        }
        .method-select:focus { border-color: rgba(79,110,247,0.4); outline: none; }

        /* Interval presets */
        .preset-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 8px;
        }
        .preset-btn {
          padding: 9px 4px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 9px;
          color: #7880a0;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .preset-btn:hover { background: rgba(79,110,247,0.1); border-color: rgba(79,110,247,0.3); color: #a5b8fa; }
        .preset-btn.active { background: rgba(79,110,247,0.15); border-color: rgba(79,110,247,0.45); color: #a5b8fa; font-weight: 500; }

        .custom-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }
        .custom-toggle {
          font-size: 11px;
          color: #464e6a;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .custom-toggle:hover { color: #7b9cf5; }
        .custom-input {
          flex: 1;
          padding: 8px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 9px;
          color: #e0e4ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .custom-input:focus { border-color: rgba(79,110,247,0.4); box-shadow: 0 0 0 2px rgba(79,110,247,0.1); }
        .custom-unit { font-size: 12px; color: #464e6a; white-space: nowrap; }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #3b5ce4, #5b4af7);
          border: none;
          border-radius: 11px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(59,92,228,0.35);
          letter-spacing: 0.02em;
          margin-top: 26px;
        }
        .submit-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent); border-radius: 11px; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(59,92,228,0.45); }
        .submit-btn:active:not(:disabled) { transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .spinner { display: inline-block; width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle; margin-right: 8px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .card-footer { text-align: center; margin-top: 20px; font-size: 12px; font-weight: 300; color: #3a3e56; }
        .card-footer-link { color: #7b9cf5; cursor: pointer; font-weight: 500; background: none; border: none; padding: 0; font-family: 'DM Sans', sans-serif; font-size: 12px; transition: color 0.2s; }
        .card-footer-link:hover { color: #a5b8fa; }

        .section-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 22px 0;
        }
        .section-title {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #464e6a;
          margin-bottom: 14px;
        }
      `}</style>

      <div className="addapi-root">
        <div className="grid-overlay" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <button className="back-btn" onClick={() => router.push("/dashboard")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Dashboard
        </button>

        <div className="inner">

          {/* LEFT */}
          <div className="left-col">
            <div className="badge">
              <div className="badge-dot" />
              <span className="badge-text">New Monitor</span>
            </div>

            <h1 className="left-headline">
              Connect your<br />
              <span>API in seconds.</span>
            </h1>

            <p className="left-desc">
              Add any HTTP endpoint and we'll continuously monitor its health, response time, and availability — so you don't have to.
            </p>

            <div className="feature-list">
              {[
                { color: "rgba(79,110,247,0.14)", stroke: "#4f6ef7", text: "Automatic uptime tracking", icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></> },
                { color: "rgba(6,182,212,0.14)", stroke: "#06b6d4", text: "Real-time response metrics", icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></> },
                { color: "rgba(29,158,117,0.14)", stroke: "#1d9e75", text: "Instant failure alerts", icon: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></> },
                { color: "rgba(139,92,246,0.14)", stroke: "#8b5cf6", text: "Custom check intervals", icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
              ].map((f, i) => (
                <div className="feat-item" key={i}>
                  <div className="feat-icon" style={{ background: f.color }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={f.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                  </div>
                  <span className="feat-text">{f.text}</span>
                </div>
              ))}
            </div>

            {/* Live preview */}
            <div className="preview-card">
              <div className="preview-label">Live preview</div>
              <div className="preview-row">
                <span className="preview-key">Name</span>
                <span className="preview-val">{name || "—"}</span>
              </div>
              <div className="preview-row">
                <span className="preview-key">Endpoint</span>
                <span className="preview-val">{url || "—"}</span>
              </div>
              <div className="preview-row">
                <span className="preview-key">Method</span>
                <span className="preview-val">{method}</span>
              </div>
              <div className="preview-row">
                <span className="preview-key">Interval</span>
                <span className="preview-val">{getInterval()}s</span>
              </div>
              <div className="preview-row">
                <span className="preview-key">Status</span>
                <span className="preview-val">
                  <span className="status-dot" />
                  Pending
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className={`card ${mounted ? "mounted" : ""}`}>
            <div className="card-eyebrow">Monitor setup</div>
            <h2 className="card-title">Add a new API</h2>
            <p className="card-subtitle">Enter your endpoint details below</p>

            {error && (
              <div className="alert alert-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {success}
              </div>
            )}

            {/* API Name */}
            <div className="field-group">
              <label className="field-label">API Name</label>
              <div className="field-wrapper">
                <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                <input
                  type="text"
                  placeholder="e.g. Payment Service, Auth API"
                  className="field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* Endpoint URL + Method */}
            <div className="field-group">
              <label className="field-label">Endpoint URL</label>
              <div className="url-row">
                <select
                  className="method-select"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="HEAD">HEAD</option>
                </select>
                <div className="field-wrapper" style={{ flex: 1 }}>
                  <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="https://api.example.com/health"
                    className={`field-input ${urlValid === true ? "url-ok" : urlValid === false ? "url-err" : ""}`}
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>

            <div className="section-divider" />

            {/* Check Interval */}
            <div className="field-group">
              <div className="section-title">Check interval</div>
              <div className="preset-grid">
                {INTERVAL_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    className={`preset-btn ${!useCustom && interval === p.value ? "active" : ""}`}
                    onClick={() => { setInterval(p.value); setUseCustom(false); }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="custom-row">
                <button className="custom-toggle" onClick={() => setUseCustom(!useCustom)}>
                  {useCustom ? "▾ Custom:" : "+ Custom interval"}
                </button>
                {useCustom && (
                  <>
                    <input
                      type="number"
                      className="custom-input"
                      placeholder="e.g. 120"
                      value={customInterval}
                      onChange={(e) => setCustomInterval(e.target.value)}
                      min={10}
                    />
                    <span className="custom-unit">seconds</span>
                  </>
                )}
              </div>
            </div>

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" />Starting monitor…</>
              ) : (
                "Add API & start monitoring"
              )}
            </button>

            <div className="card-footer">
              <button className="card-footer-link" onClick={() => router.push("/dashboard")}>
                ← Back to dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}