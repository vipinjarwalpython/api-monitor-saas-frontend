"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function ApiList() {
  const [apis, setApis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const fetchApis = async () => {
    try {
      const res = await api.get("/monitor/my-apis");
      setApis(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this API?")) return;

    await api.delete(`/monitor/delete-api/${id}`);
    fetchApis();
  };

  useEffect(() => {
    fetchApis();
  }, []);

  return (
    <div className="p-6 text-white">

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">My APIs 📋</h1>

        <button
          onClick={() => router.push("/dashboard/add-api")}
          className="bg-white text-black px-4 py-2 rounded"
        >
          + Add API
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">

          <table className="w-full text-left">
            <thead className="bg-gray-700 text-sm">
              <tr>
                <th className="p-4">URL</th>
                <th>Status</th>
                <th>Response</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {apis.map((apiItem) => (
                <tr key={apiItem.id} className="border-t border-gray-700 hover:bg-gray-700">

                  <td className="p-4">{apiItem.url}</td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        apiItem.status === "UP"
                          ? "bg-green-500 text-black"
                          : "bg-red-500"
                      }`}
                    >
                      {apiItem.status}
                    </span>
                  </td>

                  <td>
                    {apiItem.last_response_time
                      ? `${apiItem.last_response_time} ms`
                      : "-"}
                  </td>

                  <td className="space-x-3">
                    <button
                      onClick={() => router.push(`/dashboard/api/${apiItem.id}`)}
                      className="text-blue-400"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleDelete(apiItem.id)}
                      className="text-red-400"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {apis.length === 0 && (
            <div className="p-6 text-center text-gray-400">
              No APIs added yet 🚀
            </div>
          )}

        </div>
      )}
    </div>
  );
}