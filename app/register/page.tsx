"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);
  const [strength, setStrength] = useState(0);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const calcStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    setStrength(s);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    calcStrength(val);
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "#e24b4a", "#ef9f27", "#4f6ef7", "#1d9e75"];

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (strength < 2) {
      setError("Please choose a stronger password.");
      return;
    }
    try {
      setLoading(true);
      await api.post("/auth/register", { email, password });
      setSuccess("Account created successfully! Redirecting…");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .reg-root {
          min-height: 100vh;
          display: flex;
          background: #0a0c12;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.17;
          animation: float 10s ease-in-out infinite;
          pointer-events: none;
        }
        .orb-1 { width:480px;height:480px;background:radial-gradient(circle,#5b4af7,#1a0a6e);top:-120px;right:-80px;animation-delay:0s; }
        .orb-2 { width:360px;height:360px;background:radial-gradient(circle,#06b6d4,#0e4f6a);bottom:-80px;left:28%;animation-delay:3.5s; }
        .orb-3 { width:260px;height:260px;background:radial-gradient(circle,#8b5cf6,#3b0764);top:38%;left:-50px;animation-delay:7s; }

        @keyframes float {
          0%,100% { transform: translateY(0) scale(1); }
          33% { transform: translateY(-26px) scale(1.04); }
          66% { transform: translateY(18px) scale(0.97); }
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* LEFT */
        .left-panel {
          display: none;
          width: 50%;
          flex-direction: column;
          justify-content: center;
          padding: 60px 64px;
          position: relative;
          z-index: 1;
        }
        @media (min-width: 768px) { .left-panel { display: flex; } }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(91,74,247,0.12);
          border: 1px solid rgba(91,74,247,0.28);
          border-radius: 100px;
          padding: 6px 16px 6px 10px;
          margin-bottom: 40px;
          width: fit-content;
        }
        .brand-dot {
          width: 8px; height: 8px;
          background: #7b6af7;
          border-radius: 50%;
          box-shadow: 0 0 8px #7b6af7;
          animation: pdot 2s ease-in-out infinite;
        }
        @keyframes pdot {
          0%,100% { box-shadow: 0 0 8px #7b6af7; }
          50% { box-shadow: 0 0 18px #7b6af7; }
        }
        .badge-txt {
          font-size: 11px;
          font-weight: 500;
          color: #a594f7;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .left-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(34px, 3.8vw, 50px);
          font-weight: 700;
          color: #f0f2ff;
          line-height: 1.2;
          margin: 0 0 18px 0;
          letter-spacing: -0.02em;
        }
        .left-headline span {
          background: linear-gradient(135deg, #7b6af7, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .left-desc {
          font-size: 15px;
          font-weight: 300;
          color: #7880a0;
          line-height: 1.78;
          max-width: 360px;
          margin: 0 0 44px 0;
        }

        .steps {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          position: relative;
          padding-bottom: 24px;
        }
        .step-item:last-child { padding-bottom: 0; }
        .step-item:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 17px;
          top: 36px;
          bottom: 0;
          width: 1px;
          background: rgba(255,255,255,0.06);
        }
        .step-num {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid rgba(123,106,247,0.3);
          color: #a594f7;
          background: rgba(123,106,247,0.1);
          z-index: 1;
        }
        .step-content {}
        .step-title {
          font-size: 14px;
          font-weight: 500;
          color: #c0c4e4;
          margin-bottom: 3px;
          margin-top: 6px;
        }
        .step-desc {
          font-size: 12px;
          font-weight: 300;
          color: #464e6a;
          line-height: 1.6;
        }

        .vdiv {
          position: absolute;
          left: 50%;
          top: 8%;
          bottom: 8%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.055) 30%, rgba(255,255,255,0.055) 70%, transparent);
        }

        /* RIGHT */
        .right-panel {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 24px;
          position: relative;
          z-index: 1;
        }
        @media (min-width: 768px) { .right-panel { width: 50%; } }

        .card {
          width: 100%;
          max-width: 420px;
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

        .card-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7b6af7;
          margin-bottom: 10px;
        }
        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 600;
          color: #eef0ff;
          margin: 0 0 5px 0;
          letter-spacing: -0.01em;
        }
        .card-subtitle {
          font-size: 13px;
          font-weight: 300;
          color: #55596e;
          margin: 0 0 28px 0;
        }

        .alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 400;
          margin-bottom: 18px;
          line-height: 1.5;
          animation: slideIn 0.25s ease;
        }
        @keyframes slideIn { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform: translateY(0); } }
        .alert-error {
          background: rgba(226,75,74,0.1);
          border: 1px solid rgba(226,75,74,0.25);
          color: #f09595;
        }
        .alert-success {
          background: rgba(29,158,117,0.1);
          border: 1px solid rgba(29,158,117,0.28);
          color: #5dcaa5;
        }

        .field-group { margin-bottom: 14px; }
        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: #7880a0;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .field-wrapper { position: relative; }
        .field-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #363a52;
          pointer-events: none;
          transition: color 0.2s;
        }
        .field-input {
          width: 100%;
          padding: 12px 14px 12px 40px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 11px;
          color: #e0e4ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: #2e3148; }
        .field-input:focus {
          border-color: rgba(123,106,247,0.5);
          background: rgba(123,106,247,0.06);
          box-shadow: 0 0 0 3px rgba(123,106,247,0.1);
        }
        .field-input.has-error {
          border-color: rgba(226,75,74,0.45);
          background: rgba(226,75,74,0.04);
        }
        .field-input.has-success {
          border-color: rgba(29,158,117,0.4);
          background: rgba(29,158,117,0.04);
        }
        .toggle-pw {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #363a52;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .toggle-pw:hover { color: #a594f7; }

        /* Password strength */
        .strength-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }
        .strength-bars {
          display: flex;
          gap: 4px;
          flex: 1;
        }
        .strength-bar {
          flex: 1;
          height: 3px;
          border-radius: 3px;
          background: rgba(255,255,255,0.07);
          transition: background 0.3s;
        }
        .strength-label {
          font-size: 11px;
          font-weight: 500;
          min-width: 36px;
          text-align: right;
          transition: color 0.3s;
        }

        .reg-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #5b4af7, #7b6af7);
          border: none;
          border-radius: 11px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(91,74,247,0.38);
          letter-spacing: 0.02em;
          margin-top: 22px;
        }
        .reg-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          border-radius: 11px;
        }
        .reg-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(91,74,247,0.48);
        }
        .reg-btn:active:not(:disabled) { transform: scale(0.99); }
        .reg-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .spinner {
          display: inline-block;
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .card-footer {
          text-align: center;
          margin-top: 22px;
          font-size: 12px;
          font-weight: 300;
          color: #3a3e56;
        }
        .card-footer-link {
          color: #a594f7;
          cursor: pointer;
          font-weight: 500;
          transition: color 0.2s;
          background: none;
          border: none;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
        }
        .card-footer-link:hover { color: #c4b8fb; }

        .terms {
          text-align: center;
          font-size: 11px;
          font-weight: 300;
          color: #363a52;
          margin-top: 14px;
          line-height: 1.6;
        }
        .terms a {
          color: #605880;
          text-decoration: underline;
          cursor: pointer;
          transition: color 0.2s;
        }
        .terms a:hover { color: #a594f7; }
      `}</style>

      <div className="reg-root">
        <div className="grid-overlay" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="brand-badge">
            <div className="brand-dot" />
            <span className="badge-txt">Get Started Free</span>
          </div>

          <h1 className="left-headline">
            Set up in<br />
            <span>under 2 minutes.</span>
          </h1>

          <p className="left-desc">
            Join thousands of developers who trust API Monitor to keep their services running at peak performance, around the clock.
          </p>

          <div className="steps">
            <div className="step-item">
              <div className="step-num">1</div>
              <div className="step-content">
                <div className="step-title">Create your account</div>
                <div className="step-desc">Sign up with your email — no credit card required.</div>
              </div>
            </div>
            <div className="step-item">
              <div className="step-num">2</div>
              <div className="step-content">
                <div className="step-title">Add your first API</div>
                <div className="step-desc">Paste your endpoint URL and configure check intervals.</div>
              </div>
            </div>
            <div className="step-item">
              <div className="step-num">3</div>
              <div className="step-content">
                <div className="step-title">Get instant alerts</div>
                <div className="step-desc">Receive notifications the moment something goes wrong.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="vdiv" />

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className={`card ${mounted ? "mounted" : ""}`}>
            <div className="card-eyebrow">Create account</div>
            <h2 className="card-title">Start monitoring today</h2>
            <p className="card-subtitle">Free forever — no credit card needed</p>

            {error && (
              <div className="alert alert-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {success}
              </div>
            )}

            {/* Email */}
            <div className="field-group">
              <label className="field-label">Email address</label>
              <div className="field-wrapper">
                <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

            {/* Password */}
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrapper">
                <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="field-input"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="toggle-pw" onClick={() => setShowPassword(!showPassword)} type="button" tabIndex={-1}>
                  {showPassword ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Strength meter */}
              {password.length > 0 && (
                <div className="strength-row">
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="strength-bar"
                        style={{ background: i <= strength ? strengthColor[strength] : undefined }}
                      />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: strengthColor[strength] }}>
                    {strengthLabel[strength]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="field-group">
              <label className="field-label">Confirm password</label>
              <div className="field-wrapper">
                <svg className="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className={`field-input ${confirmPassword.length > 0 ? (confirmPassword === password ? "has-success" : "has-error") : ""}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="toggle-pw" onClick={() => setShowConfirm(!showConfirm)} type="button" tabIndex={-1}>
                  {showConfirm ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              className="reg-btn"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" />Creating account…</>
              ) : (
                "Create account"
              )}
            </button>

            <p className="terms">
              By registering, you agree to our{" "}
              <a>Terms of Service</a> and <a>Privacy Policy</a>.
            </p>

            <div className="card-footer">
              Already have an account?{" "}
              <button className="card-footer-link" onClick={() => router.push("/login")}>
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}