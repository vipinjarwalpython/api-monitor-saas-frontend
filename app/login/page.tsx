"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { extractApiError } from "@/lib/api/utils";
import { isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await authAPI.login(email, password);
      router.push("/dashboard");
    } catch (loginError) {
      setError(extractApiError(loginError, "Unable to sign in."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={pageStyle}>
      <div style={ambientOrbOne} />
      <div style={ambientOrbTwo} />
      <div style={cardStyle}>
        <div style={eyebrowStyle}>Welcome back</div>
        <h1 style={titleStyle}>Sign in to API Monitor</h1>
        <p style={subtitleStyle}>
          Login uses the backend’s current form-encoded auth endpoint and restores your protected dashboard session.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={inputStyle}
              placeholder="you@company.com"
              required
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={inputStyle}
              placeholder="Enter your password"
              required
            />
          </Field>

          {error ? <div style={errorStyle}>{error}</div> : null}

          <button type="submit" disabled={submitting} style={primaryButtonStyle}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div style={footerStyle}>
          Don&apos;t have an account? <Link href="/register" style={linkStyle}>Create one</Link>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 24,
  position: "relative",
  overflow: "hidden",
  background: "#0a0c12",
  fontFamily: "'DM Sans', var(--font-geist-sans), sans-serif",
};

const cardStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  width: "100%",
  maxWidth: 420,
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.07)",
  background: "rgba(255,255,255,0.03)",
  padding: 32,
  color: "#eef0ff",
  boxShadow: "0 40px 80px rgba(0,0,0,0.45)",
};

const eyebrowStyle: React.CSSProperties = {
  color: "#8ea5ff",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const titleStyle: React.CSSProperties = {
  margin: "10px 0 0",
  fontSize: 30,
  lineHeight: 1.1,
  letterSpacing: "-0.04em",
};

const subtitleStyle: React.CSSProperties = {
  margin: "10px 0 24px",
  color: "#7d84a4",
  lineHeight: 1.7,
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  color: "#7d84a4",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#eef0ff",
  padding: "13px 14px",
  fontSize: 14,
};

const errorStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(226,75,74,0.25)",
  background: "rgba(226,75,74,0.12)",
  color: "#f2a09f",
  padding: "12px 14px",
  fontSize: 13,
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 14,
  background: "linear-gradient(135deg, #3b5ce4, #5b4af7)",
  color: "#fff",
  padding: "14px 16px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const footerStyle: React.CSSProperties = {
  marginTop: 18,
  color: "#7d84a4",
  fontSize: 14,
};

const linkStyle: React.CSSProperties = {
  color: "#b2beff",
  textDecoration: "none",
  fontWeight: 700,
};

const ambientOrbOne: React.CSSProperties = {
  position: "absolute",
  width: 420,
  height: 420,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(79,110,247,0.5), rgba(79,110,247,0))",
  top: -120,
  left: -80,
  filter: "blur(60px)",
};

const ambientOrbTwo: React.CSSProperties = {
  position: "absolute",
  width: 360,
  height: 360,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(139,92,246,0.45), rgba(139,92,246,0))",
  bottom: -80,
  right: -60,
  filter: "blur(60px)",
};
