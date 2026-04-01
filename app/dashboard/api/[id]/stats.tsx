"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useParams } from "next/navigation";

export default function Stats() {
  const { id } = useParams();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get(`/monitor/stats/${id}`).then((res) => {
      setStats(res.data);
    });
  }, [id]);

  if (!stats) {
    return <p className="text-gray-400">Loading stats...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <p className="text-gray-400 text-sm">Total Checks</p>
        <h2 className="text-2xl font-bold">{stats.total_checks}</h2>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <p className="text-gray-400 text-sm">Success</p>
        <h2 className="text-2xl font-bold text-green-400">
          {stats.success_count}
        </h2>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <p className="text-gray-400 text-sm">Failures</p>
        <h2 className="text-2xl font-bold text-red-400">
          {stats.failure_count}
        </h2>
      </div>

    </div>
  );
}