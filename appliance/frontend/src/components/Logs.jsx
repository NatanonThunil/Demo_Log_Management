// src/components/Logs.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

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

  const severityColor = (sev) => {
    if (sev >= 8) return "bg-red-100 text-red-700"; // สูง
    if (sev >= 5) return "bg-yellow-100 text-yellow-700"; // ปานกลาง
    return "bg-green-100 text-green-700"; // ต่ำ
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "N/A";
    try {
      return new Date(ts).toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-200 shadow rounded-lg">
        <thead className="bg-indigo-50 text-indigo-700">
          <tr>
            <th className="border px-4 py-2">Timestamp</th>
            <th className="border px-4 py-2">User</th>
            <th className="border px-4 py-2">Action / Event</th>
            <th className="border px-4 py-2">Source IP</th>
            <th className="border px-4 py-2">Message</th>
            <th className="border px-4 py-2">Severity</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs
              .slice(0, 7) // แสดงเฉพาะ 7 รายการล่าสุด
              .map((log, idx) => {
                let action = log.action;
                if (!action && log.raw) {
                  try {
                    const raw = typeof log.raw === "string" ? JSON.parse(log.raw) : log.raw;
                    action = raw.action || log.event_type;
                  } catch {}
                }

                return (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "hover:bg-gray-100"}
                  >
                    <td className="border px-4 py-2">{formatTimestamp(log.ts)}</td>
                    <td className="border px-4 py-2">{log.user || "N/A"}</td>
                    <td className="border px-4 py-2">{action || "N/A"}</td>
                    <td className="border px-4 py-2">{log.src_ip || "N/A"}</td>
                    <td className="border px-4 py-2">{log.msg || "N/A"}</td>
                    <td className={`border px-4 py-2 font-bold ${severityColor(log.severity ?? 0)}`}>
                      {log.severity ?? "N/A"}
                    </td>
                  </tr>
                );
              })
          ) : (
            <tr>
              <td colSpan={6} className="text-center text-gray-500 py-4">
                No logs available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
