// app/dashboard/layout.tsx
//
// This ONE layout wraps EVERY page under /dashboard.
// Both Dashboard and Add API (and any future pages) use the same
// Sidebar + Navbar — no more conflicts between pages.
//
// How it prevents overlap:
//   • Sidebar: position fixed, 220px wide — always visible on the left.
//   • Main column: marginLeft 220px, height 100vh, overflowY auto — own scroll container.
//   • Navbar: position STICKY inside the main column — sticks to top of the
//     scroll area but is still in document flow, so page content always
//     renders directly below it. Never overlaps anything.

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0a0c12",
        scrollBehavior: "smooth",
      }}
    >
      {/* ── Fixed sidebar (220px) ── */}
      <Sidebar />

      {/* ── Main scrollable column ── */}
      <div
        style={{
          marginLeft: "220px",   // exactly sidebar width — no gap, no overlap
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflowY: "auto",     // THIS is the scroll container
          overflowX: "hidden",   // prevent horizontal scroll
          position: "relative",  // establish stacking context
          scrollbarGutter: "stable", // prevent layout shift from scrollbar
        }}
      >
        {/* Sticky navbar — part of flow, never overlaps children */}
        <Navbar />

        {/* Page content — no marginTop needed */}
        <main
          style={{
            flex: 1,
            backgroundColor: "#0a0c12",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}