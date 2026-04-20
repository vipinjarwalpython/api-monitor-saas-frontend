"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { statusTone } from "@/lib/format";

const cardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.028)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 20,
  padding: 24,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
};

export function DashboardPage({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 56px)",
        padding: "32px 32px 48px",
        background: "#0a0c12",
        color: "#eef0ff",
        fontFamily: "'DM Sans', var(--font-geist-sans), sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <div>
          {eyebrow ? (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#7b9cf5",
                marginBottom: 8,
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          <h1
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', var(--font-geist-serif), serif",
              fontSize: 30,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              style={{
                margin: "8px 0 0",
                color: "#6f7693",
                fontSize: 14,
                maxWidth: 720,
                lineHeight: 1.7,
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function Card({
  title,
  subtitle,
  action,
  children,
  style,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section style={{ ...cardStyle, ...style }}>
      {(title || subtitle || action) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <div>
            {title ? (
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#eef0ff" }}>{title}</h2>
            ) : null}
            {subtitle ? (
              <p style={{ margin: "6px 0 0", color: "#6f7693", fontSize: 13, lineHeight: 1.6 }}>
                {subtitle}
              </p>
            ) : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: 16,
        marginBottom: 24,
      }}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <Card>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6f7693" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 34,
          marginTop: 10,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "#eef0ff",
        }}
      >
        {value}
      </div>
      {hint ? <div style={{ marginTop: 8, fontSize: 13, color: "#6f7693" }}>{hint}</div> : null}
    </Card>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "error";
  children: ReactNode;
}) {
  const palette =
    tone === "success"
      ? { background: "rgba(29,158,117,0.12)", border: "rgba(29,158,117,0.25)", color: "#6fe0ba" }
      : tone === "error"
        ? { background: "rgba(226,75,74,0.12)", border: "rgba(226,75,74,0.25)", color: "#f2a09f" }
        : { background: "rgba(79,110,247,0.12)", border: "rgba(79,110,247,0.25)", color: "#aab8ff" };

  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        background: palette.background,
        border: `1px solid ${palette.border}`,
        color: palette.color,
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card
      style={{
        borderStyle: "dashed",
        textAlign: "center",
        padding: "48px 24px",
      }}
    >
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title}</h3>
      <p
        style={{
          margin: "10px auto 0",
          maxWidth: 480,
          color: "#6f7693",
          lineHeight: 1.7,
          fontSize: 14,
        }}
      >
        {description}
      </p>
      {action ? <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>{action}</div> : null}
    </Card>
  );
}

export function ActionButton({
  children,
  tone = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "ghost" | "danger";
}) {
  const palette =
    tone === "ghost"
      ? {
          background: "rgba(255,255,255,0.04)",
          border: "rgba(255,255,255,0.08)",
          color: "#d5daf5",
        }
      : tone === "danger"
        ? {
            background: "rgba(226,75,74,0.12)",
            border: "rgba(226,75,74,0.25)",
            color: "#f2a09f",
          }
        : {
            background: "linear-gradient(135deg, #3b5ce4, #5b4af7)",
            border: "transparent",
            color: "#ffffff",
          };

  return (
    <button
      {...props}
      style={{
        borderRadius: 12,
        border: `1px solid ${palette.border}`,
        background: palette.background,
        color: palette.color,
        padding: "10px 16px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        opacity: props.disabled ? 0.65 : 1,
        ...props.style,
      }}
    >
      {children}
    </button>
  );
}

export function StatusPill({
  status,
  isDown,
  paused,
}: {
  status?: string | null;
  isDown?: boolean;
  paused?: boolean;
}) {
  const tone = paused ? statusTone("PAUSED") : statusTone(status, isDown);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: tone.background,
        border: `1px solid ${tone.border}`,
        color: tone.color,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: tone.dot,
          boxShadow: `0 0 8px ${tone.dot}`,
        }}
      />
      {tone.label}
    </span>
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <Card>
      <div style={{ color: "#6f7693", fontSize: 14 }}>{label}</div>
    </Card>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: string; label: string }>;
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.025)",
        marginBottom: 20,
        flexWrap: "wrap",
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            border: "none",
            borderRadius: 10,
            padding: "10px 14px",
            background: active === tab.id ? "rgba(255,255,255,0.08)" : "transparent",
            color: active === tab.id ? "#eef0ff" : "#6f7693",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function ThemedSelect({
  value,
  options,
  onChange,
  ariaLabel,
  disabled,
  style,
}: {
  value: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  onChange: (value: string) => void;
  ariaLabel?: string;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        minWidth: 160,
        width: "100%",
        ...style,
      }}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          borderRadius: 12,
          border: open ? "1px solid rgba(123,156,245,0.45)" : "1px solid rgba(255,255,255,0.08)",
          background: "#151922",
          color: "#eef0ff",
          padding: "11px 12px",
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.2,
          boxShadow: open ? "0 0 0 3px rgba(79,110,247,0.16)" : "none",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.65 : 1,
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected?.label ?? "Select"}
        </span>
        <span style={{ color: "#7d84a4", fontSize: 11 }}>{open ? "^" : "v"}</span>
      </button>

      {open ? (
        <div
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 50,
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            maxHeight: 260,
            overflowY: "auto",
            padding: 4,
            borderRadius: 12,
            border: "1px solid rgba(123,156,245,0.22)",
            background: "#10141d",
            boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          }}
        >
          {options.map((option) => {
            const selectedOption = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selectedOption}
                disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) {
                    return;
                  }

                  onChange(option.value);
                  setHoveredValue(null);
                  setOpen(false);
                }}
                onMouseEnter={() => setHoveredValue(option.value)}
                onMouseLeave={() => setHoveredValue(null)}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 9,
                  background: selectedOption
                    ? "#294f9f"
                    : hoveredValue === option.value
                      ? "rgba(123,156,245,0.16)"
                      : "transparent",
                  color: option.disabled ? "#6f7693" : "#eef0ff",
                  padding: "10px 11px",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: option.disabled ? "not-allowed" : "pointer",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
