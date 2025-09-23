import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

export default function Logs({ token }) {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();
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
    if (sev >= 8) return "bg-red-100 text-red-700 font-bold";
    if (sev >= 5) return "bg-yellow-100 text-yellow-700 font-bold";
    return "bg-green-100 text-green-700 font-bold";
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

  const filteredLogs = logs.filter((log) => {
    const action =
      log.action ||
      (log.raw && typeof log.raw === "string" ? JSON.parse(log.raw).action : log.event_type);
    return (
      log.user?.toLowerCase().includes(search.toLowerCase()) ||
      action?.toLowerCase().includes(search.toLowerCase()) ||
      log.msg?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Logs</h2>
      {/* Search */}
      <div className="relative mb-4 w-full max-w-lg">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search user, action or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500"
        />
      </div>

      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full bg-white rounded-lg">
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
            {filteredLogs.length > 0 ? (
              filteredLogs.slice(0, 7).map((log, idx) => {
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
                    className={idx % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-100"}
                  >
                    <td className="border px-4 py-2">{formatTimestamp(log.ts)}</td>
                    <td className="border px-4 py-2 font-medium">{log.user || "N/A"}</td>
                    <td className="border px-4 py-2">{action || "N/A"}</td>
                    <td className="border px-4 py-2">{log.src_ip || "N/A"}</td>
                    <td className="border px-4 py-2">{log.msg || "N/A"}</td>
                    <td className={`border px-4 py-2 text-center rounded ${severityColor(log.severity ?? 0)}`}>
                      {log.severity ?? "N/A"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-4">
                  No logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
