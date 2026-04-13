import type { MyApi } from "@/types";

export default function Table({ apis }: { apis: MyApi[] }) {
  return (
    <table className="w-full bg-white shadow rounded">
      <thead>
        <tr className="bg-gray-200">
          <th>Name</th>
          <th>URL</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {apis.map((api) => (
          <tr key={api.id} className="text-center border-t">
            <td>{api.name}</td>
            <td>{api.url}</td>
            <td>
              <span
                className={`px-2 py-1 rounded text-white ${
                  api.status === "UP" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {api.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
