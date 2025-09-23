import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

export default function Users({ token, currentUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:4000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.rows || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleRoleChange = async (username, newRole) => {
    if (username === currentUser) {
      alert("Cannot change your own role");
      return;
    }

    try {
      await axios.put(
        `http://localhost:4000/admin/users/${username}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      console.error("Failed to update role:", err);
      alert(err.response?.data?.error || "Failed to update role");
    }
  };

  const filteredUsers = users
    .filter(
      (u) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase()) ||
        u.tenant.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 7); // แสดงแค่ 7 รายการล่าสุด

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Users</h2>

      {/* Search */}
      <div className="relative mb-4 w-full max-w-md">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search username, role or tenant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <p className="text-gray-500">No users found</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-2 px-4 text-left">No.</th>
                <th className="py-2 px-4 text-left">Username</th>
                <th className="py-2 px-4 text-left">Role</th>
                <th className="py-2 px-4 text-left">Tenant</th>
                <th className="py-2 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-100"}
                >
                  <td className="py-2 px-4">{i + 1}</td>
                  <td className="py-2 px-4 font-medium text-gray-700">{user.username}</td>
                  <td className="py-2 px-4 capitalize">{user.role}</td>
                  <td className="py-2 px-4">{user.tenant}</td>
                  <td className="py-2 px-4">
                    {user.username !== currentUser ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.username, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 hover:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      >
                        <option value="viewer">viewer</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
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
