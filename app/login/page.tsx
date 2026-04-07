"use client";

import { useState, useEffect } from "react";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!email || !password) {
        setError("Please enter email and password");
        return;
      }

      await authAPI.login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      const errorMsg = err?.message || err?.response?.data?.details || "Invalid email or password";
      setError(errorMsg);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .login-root {
          min-height: 100vh;
          display: flex;
          background: #0a0c12;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Animated background orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          animation: float 10s ease-in-out infinite;
          pointer-events: none;
        }
        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #4f6ef7, #1a2a8a);
          top: -120px; left: -100px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 380px; height: 380px;
          background: radial-gradient(circle, #8b5cf6, #3b0764);
          bottom: -80px; right: 30%;
          animation-delay: 3s;
        }
        .orb-3 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #06b6d4, #0e4f6a);
          top: 40%; right: -60px;
          animation-delay: 6s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          33% { transform: translateY(-30px) scale(1.05); }
          66% { transform: translateY(20px) scale(0.97); }
        }

        /* Subtle grid overlay */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* LEFT PANEL */
        .left-panel {
          display: none;
          width: 50%;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 60px 64px;
          position: relative;
          z-index: 1;
        }
        @media (min-width: 768px) {
          .left-panel { display: flex; }
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(79, 110, 247, 0.12);
          border: 1px solid rgba(79, 110, 247, 0.25);
          border-radius: 100px;
          padding: 6px 16px 6px 10px;
          margin-bottom: 48px;
        }
        .brand-dot {
          width: 8px; height: 8px;
          background: #4f6ef7;
          border-radius: 50%;
          box-shadow: 0 0 8px #4f6ef7;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #4f6ef7; }
          50% { opacity: 0.6; box-shadow: 0 0 16px #4f6ef7; }
        }
        .brand-badge-text {
          font-size: 12px;
          font-weight: 500;
          color: #7b9cf5;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .left-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 4vw, 52px);
          font-weight: 700;
          color: #f0f2ff;
          line-height: 1.2;
          margin: 0 0 20px 0;
          letter-spacing: -0.02em;
        }
        .left-headline span {
          background: linear-gradient(135deg, #4f6ef7, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .left-desc {
          font-size: 16px;
          font-weight: 300;
          color: #8890b0;
          line-height: 1.75;
          max-width: 380px;
          margin: 0 0 52px 0;
        }

        .stat-row {
          display: flex;
          gap: 40px;
        }
        .stat-item {}
        .stat-number {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 600;
          color: #e8ecff;
          line-height: 1;
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 12px;
          font-weight: 400;
          color: #555e80;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .divider-line {
          position: absolute;
          left: 50%;
          top: 10%;
          bottom: 10%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent);
        }

        /* RIGHT PANEL */
        .right-panel {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 24px;
          position: relative;
          z-index: 1;
        }
        @media (min-width: 768px) {
          .right-panel { width: 50%; }
        }

        .card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 24px;
          padding: 44px 40px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
            0 40px 80px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.06);
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .card.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .card-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4f6ef7;
          margin-bottom: 12px;
        }

        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 600;
          color: #eef0ff;
          margin: 0 0 6px 0;
          letter-spacing: -0.01em;
        }

        .card-subtitle {
          font-size: 14px;
          font-weight: 300;
          color: #606480;
          margin: 0 0 36px 0;
        }

        .field-group {
          margin-bottom: 16px;
        }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #8890b0;
          margin-bottom: 8px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .field-wrapper {
          position: relative;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #404560;
          transition: color 0.2s;
          pointer-events: none;
        }

        .field-input {
          width: 100%;
          padding: 13px 16px 13px 42px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          color: #e8ecff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 400;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .field-input::placeholder {
          color: #363b55;
        }
        .field-input:focus {
          border-color: rgba(79, 110, 247, 0.5);
          background: rgba(79, 110, 247, 0.06);
          box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.1);
        }

        .field-input:focus ~ .field-icon,
        .field-input:focus + .field-icon {
          color: #4f6ef7;
        }

        .toggle-pw {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #404560;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .toggle-pw:hover { color: #7b9cf5; }

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -8px;
          margin-bottom: 28px;
        }
        .forgot-link {
          font-size: 12px;
          font-weight: 400;
          color: #555e80;
          cursor: pointer;
          transition: color 0.2s;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
        }
        .forgot-link:hover { color: #7b9cf5; }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 20px;
          color: #ef4444;
          font-size: 13px;
          font-weight: 400;
          line-height: 1.5;
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #3b5ce4, #5b4af7);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(59, 92, 228, 0.35);
          letter-spacing: 0.02em;
        }
        .login-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          border-radius: 12px;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(59, 92, 228, 0.45);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0px) scale(0.99);
        }
        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }
        .divider-hr {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
          border: none;
        }
        .divider-text {
          font-size: 12px;
          color: #404560;
          white-space: nowrap;
        }

        .social-row {
          display: flex;
          gap: 10px;
          margin-bottom: 28px;
        }
        .social-btn {
          flex: 1;
          padding: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          color: #8890b0;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 400;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .social-btn:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.12);
          color: #c8ccee;
        }

        .card-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          font-weight: 300;
          color: #404560;
        }
        .card-footer-link {
          color: #7b9cf5;
          cursor: pointer;
          font-weight: 500;
          transition: color 0.2s;
          background: none;
          border: none;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
        }
        .card-footer-link:hover { color: #a5b8fa; }

        /* Floating feature badges on left */
        .feature-cards {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 48px;
        }
        .feature-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 14px 18px;
          backdrop-filter: blur(12px);
        }
        .feature-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .feature-icon-wrap.blue { background: rgba(79, 110, 247, 0.15); }
        .feature-icon-wrap.purple { background: rgba(139, 92, 246, 0.15); }
        .feature-icon-wrap.teal { background: rgba(6, 182, 212, 0.15); }
        .feature-text-title {
          font-size: 13px;
          font-weight: 500;
          color: #c8ccee;
          margin-bottom: 2px;
        }
        .feature-text-sub {
          font-size: 12px;
          font-weight: 300;
          color: #50546e;
        }
      `}</style>

      <div className="login-root">
        <div className="grid-overlay" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="brand-badge">
            <div className="brand-dot" />
            <span className="brand-badge-text">Live Monitoring</span>
          </div>

          <h1 className="left-headline">
            Your APIs,<br />
            <span>Always Online.</span>
          </h1>

          <p className="left-desc">
            Monitor performance in real-time, get instant alerts, and track uptime across all your services from one elegant dashboard.
          </p>

          <div className="stat-row">
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime SLA</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">&lt;2s</div>
              <div className="stat-label">Alert Speed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">APIs Tracked</div>
            </div>
          </div>

          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon-wrap blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div>
                <div className="feature-text-title">Real-time metrics</div>
                <div className="feature-text-sub">Response time, error rates & throughput</div>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap purple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div>
                <div className="feature-text-title">Instant alerts</div>
                <div className="feature-text-sub">SMS, email & Slack notifications</div>
              </div>
            </div>
          </div>
        </div>

        <div className="divider-line" />

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className={`card ${mounted ? "mounted" : ""}`}>
            <div className="card-eyebrow">Welcome back</div>
            <h2 className="card-title">Sign in to your account</h2>
            <p className="card-subtitle">Enter your credentials to continue</p>

            {/* Social login */}
            <div className="social-row">
              <button className="social-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="social-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#6e7191">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>

            <div className="divider">
              <hr className="divider-hr" />
              <span className="divider-text">or continue with email</span>
              <hr className="divider-hr" />
            </div>

            {/* Email field */}
            <div className="field-group">
              <label className="field-label">Email address</label>
              <div className="field-wrapper">
                <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="field-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrapper">
                <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="field-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="toggle-pw" onClick={() => setShowPassword(!showPassword)} type="button" tabIndex={-1}>
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="forgot-row">
              <button className="forgot-link" type="button">Forgot password?</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" />Signing in...</>
              ) : (
                "Sign in"
              )}
            </button>

            <div className="card-footer">
              Don&apos;t have an account?{" "}
              <button className="card-footer-link" onClick={() => router.push("/register")}>
                Create account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}