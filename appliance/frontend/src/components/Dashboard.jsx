// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Logs from "./Logs";
import Alerts from "./Alerts";
import Users from "./Users";
import axios from "axios";

export default function Dashboard({ token, role, logout }) {
  const [summary, setSummary] = useState({
    logs: 0,
    alerts: 0,
    users: 0,
  });
  const [username, setUsername] = useState("");

  // ดึง username จาก token
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsername(payload.username || "User");
      } catch {
        setUsername("User");
      }
    }
  }, [token]);

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSummary = async () => {
    try {
      // Fetch logs count
      const logsRes = await axios.get("http://localhost:4000/logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const logsCount = logsRes.data?.rows?.length || 0;

      // Fetch alerts count
      const alertsRes = await axios.get("http://localhost:4000/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const alertsCount = alertsRes.data?.rows?.length || 0;

      // Fetch users count (admin only)
      let usersCount = 0;
      if (role === "admin") {
        const usersRes = await axios.get("http://localhost:4000/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        usersCount = usersRes.data?.rows?.length || 0;
      }

      setSummary({
        logs: logsCount,
        alerts: alertsCount,
        users: usersCount,
      });
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ส่ง username เข้า Sidebar */}
      <Sidebar role={role} username={username} />
      <div className="flex-1 flex flex-col">
        <Header logout={logout} />

        <main className="p-6 flex-1">
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-5 flex items-center">
              <div className="flex-1">
                <p className="text-gray-500 font-medium">Total Logs</p>
                <p className="text-2xl font-bold">{summary.logs}</p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-5 flex items-center">
              <div className="flex-1">
                <p className="text-gray-500 font-medium">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">{summary.alerts}</p>
              </div>
            </div>

            {role === "admin" && (
              <div className="bg-white shadow rounded-lg p-5 flex items-center">
                <div className="flex-1">
                  <p className="text-gray-500 font-medium">Users</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.users}</p>
                </div>
              </div>
            )}
          </div>

          {/* Routes */}
          <div className="bg-white shadow rounded-lg p-4">
            <Routes>
              <Route
                path="/"
                element={<div className="text-gray-700 text-lg">Welcome to the Dashboard!</div>}
              />
              <Route path="/logs" element={<Logs token={token} />} />
              <Route path="/alerts" element={<Alerts token={token} />} />
              <Route
                path="/users"
                element={role === "admin" ? <Users token={token} /> : <Navigate to="/" />}
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>

        <footer className="bg-indigo-600 text-white p-4 text-center text-sm shadow-inner">
          © 2025 MyCompany. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
