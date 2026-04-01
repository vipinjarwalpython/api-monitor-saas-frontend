"use client";

import { useState } from "react";
import Stats from "./stats";
import Logs from "./logs";

export default function ApiDetailsPage() {
  const [tab, setTab] = useState("stats");

  return (
    <div className="p-6 text-white">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">
        API Details 📊
      </h1>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("stats")}
          className={`px-4 py-2 rounded ${
            tab === "stats"
              ? "bg-white text-black"
              : "bg-gray-700"
          }`}
        >
          Stats
        </button>

        <button
          onClick={() => setTab("logs")}
          className={`px-4 py-2 rounded ${
            tab === "logs"
              ? "bg-white text-black"
              : "bg-gray-700"
          }`}
        >
          Logs
        </button>
      </div>

      {/* CONTENT */}
      {tab === "stats" ? <Stats /> : <Logs />}

    </div>
  );
}