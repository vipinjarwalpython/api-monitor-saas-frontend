// app/dashboard/layout.tsx
// KEY FIX: Navbar uses position: sticky (not fixed).
// This means it sticks to the top of the scrollable column
// but is still part of the document flow — it never overlaps page content.

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0c12" }}>

      {/* Sidebar: fixed to the left edge */}
      <Sidebar />

      {/* Main area: offset by sidebar width, fills remaining space */}
      <div
        style={{
          marginLeft: "220px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          // This column is the scroll container
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {/* Navbar sticks to top of THIS column, not the whole viewport */}
        <Navbar />

        {/* Page content — no marginTop needed, navbar is in flow */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>

    </div>
  );
}