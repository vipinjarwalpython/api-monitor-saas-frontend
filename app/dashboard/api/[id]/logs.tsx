"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useParams } from "next/navigation";

export default function Logs() {
  const { id } = useParams();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/monitor/logs/${id}`)
      .then((res) => {
        setLogs(res.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-gray-400">Loading logs...</p>;
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">

      <table className="w-full text-left">

        <thead className="bg-gray-700 text-sm">
          <tr>
            <th className="p-4">Status</th>
            <th>Response Time</th>
            <th>Checked At</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log, index) => (
            <tr key={index} className="border-t border-gray-700">

              <td className="p-4">
                <span
                  className={`px-2 py-1 rounded ${
                    log.status_code === 200
                      ? "bg-green-500 text-black"
                      : "bg-red-500"
                  }`}
                >
                  {log.status_code}
                </span>
              </td>

              <td>{log.response_time} ms</td>

              <td className="text-gray-400">
                {log.created_at}
              </td>

            </tr>
          ))}
        </tbody>

      </table>

      {logs.length === 0 && (
        <div className="p-6 text-center text-gray-400">
          No logs found
        </div>
      )}
    </div>
  );
}