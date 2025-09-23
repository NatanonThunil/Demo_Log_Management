import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Users({ token, currentUser }) {
  const [users, setUsers] = useState([]);

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

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Users</h2>

      {users.length === 0 ? (
        <p className="text-gray-500">No users available</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
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
              {users.map((user, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="py-2 px-4">{i + 1}</td>
                  <td className="py-2 px-4">{user.username}</td>
                  <td className="py-2 px-4">{user.role}</td>
                  <td className="py-2 px-4">{user.tenant}</td>
                  <td className="py-2 px-4">
                    {user.username !== currentUser && (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.username, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="viewer">viewer</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                    {user.username === currentUser && <span className="text-gray-400">—</span>}
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
