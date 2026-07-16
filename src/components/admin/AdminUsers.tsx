"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { authFetch } from "@/lib/api";

type User = { _id: string; name: string; email: string; role: string; createdAt: string };

export default function AdminUsers() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ user: User } | null>(null);
  const [instituteName, setInstituteName] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const token = await getToken();
    if (!token) return;
    authFetch("/api/users", token).then(setUsers).catch(console.error).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function updateRole(user: User, role: string) {
    if (role === "institute") {
      setInstituteName("");
      setCustomCode("");
      setError("");
      setModal({ user });
      return;
    }
    const token = await getToken();
    if (!token) return;
    const updated = await authFetch(`/api/users/${user._id}/role`, token, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    setUsers(prev => prev.map(u => u._id === user._id ? updated : u));
  }

  async function createInstitute(autoCode: boolean) {
    if (!modal) return;
    if (!instituteName.trim()) { setError("Institute name is required"); return; }
    setSaving(true);
    setError("");
    try {
      const token = await getToken();
      const body: Record<string, string> = { userId: modal.user._id, name: instituteName.trim() };
      if (!autoCode && customCode.trim()) body.referralCode = customCode.trim();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/institutes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); setSaving(false); return; }
      setModal(null);
      load();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-slate-400 text-sm">Loading users...</div>;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
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
                <td className="px-5 py-3.5"><RoleBadge role={user.role} /></td>
                <td className="px-5 py-3.5 text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    {["user", "admin", "institute"].filter(r => r !== user.role).map(r => (
                      <button key={r} onClick={() => updateRole(user, r)}
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
        </div>
        {users.length === 0 && <div className="text-center py-12 text-slate-400">No users found</div>}
      </div>

      {/* Institute setup modal */}
      {modal && (
        <div className="fixed inset-0 z-300 flex items-center justify-center px-4" onClick={() => setModal(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-7" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-slate-900 mb-1">Set up Institute</h2>
            <p className="text-slate-500 text-sm mb-5">
              Creating institute profile for <span className="font-semibold text-slate-700">{modal.user.name || modal.user.email}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Institute name</label>
                <input value={instituteName} onChange={e => setInstituteName(e.target.value)}
                  placeholder="e.g. Miranda House, SRCC"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                  Custom referral code <span className="text-slate-300 font-normal normal-case">(leave blank to auto-generate)</span>
                </label>
                <input value={customCode} onChange={e => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MIRANDA2025"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-400 uppercase" />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={() => createInstitute(false)} disabled={saving}
                  className="flex-1 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : customCode ? "Use custom code" : "Use entered code"}
                </button>
                <button onClick={() => createInstitute(true)} disabled={saving}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
                  Auto-generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
