// Sidebar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiHome, HiClipboardList, HiBell, HiUsers } from "react-icons/hi";

export default function Sidebar({ role, username }) {
  const [isExpanded, setIsExpanded] = useState(true); // layout state

  return (
    <aside
      className={`bg-white h-screen shadow-md p-4 flex flex-col transition-all duration-300 ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-4 pb-4 border-b border-gray-300">
        <img
          src={`https://i.pravatar.cc/100?u=${username}`} // avatar unique ตาม username
          alt="Profile"
          className={`rounded-full mb-2 transition-all duration-300 ${
            isExpanded ? "w-20 h-20" : "w-10 h-10"
          }`}
        />
        {isExpanded && (
          <span className="text-gray-700 font-semibold">
            {username || "User"}
          </span>
        )}
      </div>

      {/* Layout toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-4 self-end w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full text-gray-600 hover:bg-indigo-600 hover:text-white transition-all"
      >
        {isExpanded ? "«" : "»"}
      </button>

      {/* Links */}
      <nav className="flex flex-col space-y-2">
        <Link
          to="/"
          className="flex items-center text-gray-700 hover:text-indigo-600 hover:bg-gray-100 p-2 rounded-md"
        >
          <HiHome className="mr-2 text-xl" />
          {isExpanded && "Dashboard"}
        </Link>

        <Link
          to="/logs"
          className="flex items-center text-gray-700 hover:text-indigo-600 hover:bg-gray-100 p-2 rounded-md"
        >
          <HiClipboardList className="mr-2 text-xl" />
          {isExpanded && "Logs"}
        </Link>

        <Link
          to="/alerts"
          className="flex items-center text-gray-700 hover:text-indigo-600 hover:bg-gray-100 p-2 rounded-md"
        >
          <HiBell className="mr-2 text-xl" />
          {isExpanded && "Alerts"}
        </Link>

        {role === "admin" && (
          <Link
            to="/users"
            className="flex items-center text-gray-700 hover:text-indigo-600 hover:bg-gray-100 p-2 rounded-md"
          >
            <HiUsers className="mr-2 text-xl" />
            {isExpanded && "Users"}
          </Link>
        )}
      </nav>
    </aside>
  );
}
