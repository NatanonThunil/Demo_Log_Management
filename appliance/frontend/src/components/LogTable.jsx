// src/components/Logs.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

// Component แสดงตาราง logs
function LogTable({ logs }) {
  const logList = Array.isArray(logs) ? logs : [];

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-200 shadow rounded-lg">
        <thead className="bg-indigo-50 text-indigo-700">
          <tr>
            <th className="border border-gray-200 px-4 py-2">Timestamp</th>
            <th className="border border-gray-200 px-4 py-2">User</th>
            <th className="border border-gray-200 px-4 py-2">Message</th>
            <th className="border border-gray-200 px-4 py-2">Severity</th>
          </tr>
        </thead>
        <tbody>
          {logList.length > 0 ? (
            logList.map((log, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "hover:bg-gray-100"}
              >
                <td className="border border-gray-200 px-4 py-2">{log.ts || "N/A"}</td>
                <td className="border border-gray-200 px-4 py-2">{log.user || "N/A"}</td>
                <td className="border border-gray-200 px-4 py-2">{log.msg || "N/A"}</td>
                <td className="border border-gray-200 px-4 py-2">{log.severity ?? "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center text-gray-500 py-4">
                No logs available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Component ดึง logs จาก backend
export default function Logs({ token }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:4000/logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data?.rows || []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Logs</h2>
      <LogTable logs={logs} />
    </div>
  );
}
