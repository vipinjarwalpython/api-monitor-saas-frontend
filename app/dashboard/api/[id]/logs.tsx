"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useParams } from "next/navigation";

interface Log {
  status_code: number;
  response_time: number;
  created_at: string;
}

function formatDate(raw: string) {
  try {
    const d = new Date(raw);
    return d.toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
    });
  } catch {
    return raw;
  }
}

function statusStyle(code: number) {
  if (code >= 200 && code < 300) return { bg: "rgba(29,158,117,0.14)", border: "rgba(29,158,117,0.3)", color: "#3dcaa0" };
  if (code >= 400 && code < 500) return { bg: "rgba(239,159,39,0.14)", border: "rgba(239,159,39,0.3)", color: "#f0b84a" };
  return { bg: "rgba(226,75,74,0.14)", border: "rgba(226,75,74,0.3)", color: "#f09595" };
}

export default function Logs() {
  const { id } = useParams();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/monitor/logs/${id}`)
      .then((res) => setLogs(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

        .logs-wrap {
          font-family: 'DM Sans', sans-serif;
        }

        .logs-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }

        .logs-head {
          display: grid;
          grid-template-columns: 120px 1fr 1fr;
          padding: 11px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }
        .lh {
          font-size: 10px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #2e3248;
        }

        .log-row {
          display: grid;
          grid-template-columns: 120px 1fr 1fr;
          padding: 13px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.035);
          align-items: center;
          transition: background 0.14s;
        }
        .log-row:last-child { border-bottom: none; }
        .log-row:hover { background: rgba(255,255,255,0.02); }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
        }
        .status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
        }

        .resp-val {
          font-size: 13px;
          font-weight: 400;
          color: #9098b8;
          font-variant-numeric: tabular-nums;
          display: flex; align-items: center; gap: 5px;
        }
        .resp-bar {
          display: inline-block;
          height: 3px; border-radius: 2px;
          background: rgba(79,110,247,0.35);
          max-width: 60px;
          min-width: 4px;
          vertical-align: middle;
        }

        .date-val {
          font-size: 12px;
          font-weight: 300;
          color: #404460;
          font-variant-numeric: tabular-nums;
        }

        /* Skeleton */
        .skel {
          border-radius: 5px;
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .skel-row {
          display: grid;
          grid-template-columns: 120px 1fr 1fr;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.035);
          align-items: center;
          gap: 24px;
        }

        /* Empty */
        .empty {
          padding: 56px 24px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .empty-icon {
          width: 48px; height: 48px;
          background: rgba(79,110,247,0.08);
          border: 1px solid rgba(79,110,247,0.18);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .empty-title { font-size: 14px; font-weight: 500; color: #7880a0; }
        .empty-sub { font-size: 12px; color: #363a52; }

        /* Summary bar */
        .logs-summary {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 11px 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.015);
        }
        .sum-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: #464e6a;
        }
        .sum-dot { width: 6px; height: 6px; border-radius: 50%; }
      `}</style>

      <div className="logs-wrap">
        <div className="logs-card">
          <div className="logs-head">
            <div className="lh">Status</div>
            <div className="lh">Response Time</div>
            <div className="lh">Checked At</div>
          </div>

          {loading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div className="skel-row" key={i}>
                <div className="skel" style={{ height: 22, width: 60, borderRadius: 100 }} />
                <div className="skel" style={{ height: 10, width: "45%" }} />
                <div className="skel" style={{ height: 10, width: "65%" }} />
              </div>
            ))
          ) : logs.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div className="empty-title">No logs found</div>
              <div className="empty-sub">Logs will appear here once checks have run.</div>
            </div>
          ) : (
            <>
              {logs.map((log, index) => {
                const s = statusStyle(log.status_code);
                // Scale bar width: clamp response time 0–2000ms → 4px–80px
                const barWidth = Math.min(80, Math.max(4, (log.response_time / 2000) * 80));
                return (
                  <div className="log-row" key={index}>
                    <div>
                      <span className="status-badge" style={{ background: s.bg, borderColor: s.border, color: s.color }}>
                        <span className="status-dot" style={{ background: s.color, boxShadow: `0 0 4px ${s.color}` }} />
                        {log.status_code}
                      </span>
                    </div>

                    <div className="resp-val">
                      <span className="resp-bar" style={{ width: barWidth }} />
                      {log.response_time != null
                        ? `${typeof log.response_time === "number" && log.response_time < 1
                            ? log.response_time.toFixed(4)
                            : log.response_time.toFixed(2)} ms`
                        : "—"}
                    </div>

                    <div className="date-val">{formatDate(log.created_at)}</div>
                  </div>
                );
              })}

              {/* Summary footer */}
              {(() => {
                const ok = logs.filter(l => l.status_code >= 200 && l.status_code < 300).length;
                const fail = logs.length - ok;
                return (
                  <div className="logs-summary">
                    <span className="sum-item">
                      <span className="sum-dot" style={{ background: "#1d9e75" }} />
                      {ok} success
                    </span>
                    {fail > 0 && (
                      <span className="sum-item">
                        <span className="sum-dot" style={{ background: "#e24b4a" }} />
                        {fail} failed
                      </span>
                    )}
                    <span className="sum-item" style={{ marginLeft: "auto" }}>
                      {logs.length} total entries
                    </span>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </>
  );
}