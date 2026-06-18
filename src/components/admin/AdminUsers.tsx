"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";

type User = { _id: string; name: string; email: string; role: string; createdAt: string };

export default function AdminUsers() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const token = await getToken();
    if (!token) return;
    authFetch("/api/users", token).then(setUsers).catch(console.error).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function updateRole(id: string, role: string) {
    const token = await getToken();
    if (!token) return;
    const updated = await authFetch(`/api/users/${id}/role`, token, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    setUsers(prev => prev.map(u => u._id === id ? updated : u));
  }

  if (loading) return <div className="text-slate-400 text-sm">Loading users...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Name</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Email</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Role</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Joined</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="px-5 py-3.5 font-medium text-slate-800">{user.name || "—"}</td>
              <td className="px-5 py-3.5 text-slate-500">{user.email}</td>
              <td className="px-5 py-3.5">
                <RoleBadge role={user.role} />
              </td>
              <td className="px-5 py-3.5 text-slate-400">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex gap-2">
                  {["user", "admin", "institute"].filter(r => r !== user.role).map(r => (
                    <button key={r} onClick={() => updateRole(user._id, r)}
                      className="text-xs px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors font-medium">
                      → {r}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center py-12 text-slate-400">No users found</div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin: "bg-purple-50 text-purple-700 border-purple-200",
    institute: "bg-blue-50 text-blue-700 border-blue-200",
    user: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${colors[role] || colors.user}`}>
      {role}
    </span>
  );
}
