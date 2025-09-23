import React, { useState } from "react";
import axios from "axios";

export default function Login({ onLogin, onRegisterClick }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
        username: username.trim(),
        password,
      });

      const token = res.data.token;
      if (token) {
        localStorage.setItem("token", token);
        onLogin(token);
      } else {
        setError("Login failed: no token returned");
      }
    } catch (err) {
      console.error("Login error:", err);

      let errMsg = err.response?.data?.error || "Login failed";

      // แปลงเวลาล็อกบัญชีเป็น Bangkok timezone
      if (errMsg.includes("Account locked until")) {
        const match = errMsg.match(/Account locked until (.+)$/);
        if (match) {
          const utcTimeStr = match[1]; // ตัวอย่าง: "2025-09-23T12:08:12.000Z"
          const utcDate = new Date(utcTimeStr);
          const bangkokTime = utcDate.toLocaleTimeString("en-GB", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "Asia/Bangkok",
          });
          errMsg = `Account locked until ${bangkokTime}`;
        }
      }

      setError(errMsg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-50 to-indigo-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 max-w-full">
        <h1 className="text-3xl font-extrabold text-indigo-600 mb-6 text-center">
          Log Management
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 border border-red-200 rounded p-3 mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
            required
          />

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Login
          </button>

          <button
            type="button"
            onClick={onRegisterClick}
            className="mt-2 bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors font-semibold"
          >
            Sign Up
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          &copy; 2025 MyCompany. All rights reserved.
        </p>
      </div>
    </div>
  );
}
