"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import PGForm, { type ExistingPG } from "@/components/admin/PGForm";
import { apiFetch } from "@/lib/api";

export default function EditPGPage() {
  const { id } = useParams<{ id: string }>();
  const [pg, setPg] = useState<ExistingPG | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/pgs/${id}`).then(setPg).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-[#f8faff]">
      <Navbar />
      <div className="pt-20 max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <a href="/admin" className="text-sm text-slate-400 hover:text-slate-700">← Back to Admin</a>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Edit PG</h1>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
          </div>
        ) : pg ? (
          <PGForm existing={pg} />
        ) : (
          <p className="text-slate-400">PG not found</p>
        )}
      </div>
    </div>
  );
}
