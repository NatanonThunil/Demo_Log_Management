import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Alerts({ token }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:4000/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(res.data.rows || []);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Alerts</h2>
      {alerts.length === 0 ? (
        <p className="text-gray-500">No alerts</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 shadow rounded-lg">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2 border-b">Tenant</th>
                <th className="px-4 py-2 border-b">Message</th>
                <th className="px-4 py-2 border-b">Severity</th>
                <th className="px-4 py-2 border-b">Status</th>
                <th className="px-4 py-2 border-b">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-4 py-2 border-b">{a.tenant}</td>
                  <td className="px-4 py-2 border-b">{a.message}</td>
                  <td className="px-4 py-2 border-b">
                    <span
                      className={`px-2 py-1 rounded text-white text-sm ${
                        a.severity >= 8
                          ? "bg-red-600"
                          : a.severity >= 5
                          ? "bg-yellow-500"
                          : "bg-green-600"
                      }`}
                    >
                      {a.severity ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        a.status === "new"
                          ? "bg-blue-100 text-blue-800"
                          : a.status === "ack"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {a.status || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b">
                    {a.timestamp ? new Date(a.timestamp).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
