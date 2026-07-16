import Navbar from "@/components/Navbar";
import PGForm from "@/components/admin/PGForm";

export default function NewPGPage() {
  return (
    <div className="min-h-screen bg-[#f8faff]">
      <Navbar />
      <div className="pt-28 sm:pt-36 pb-8 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <a href="/admin" className="text-sm text-slate-400 hover:text-slate-700">← Back to Admin</a>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Add New PG</h1>
        </div>
        <PGForm />
      </div>
    </div>
  );
}
