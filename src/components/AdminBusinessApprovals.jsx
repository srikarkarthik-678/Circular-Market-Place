import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../utils/api";
import CertificationBadge from "./CertificationBadge";

const STATUS_STYLES = {
  pending: { bg: "bg-yellow-500/10", text: "text-yellow-300", border: "border-yellow-500/30", label: "⏳ Pending" },
  approved: { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/30", label: "✅ Approved" },
  rejected: { bg: "bg-red-500/10", text: "text-red-300", border: "border-red-500/30", label: "❌ Rejected" },
};

const TIERS = [
  { value: "bronze", label: "🥉 Bronze", desc: "Recycles or repairs as a core service." },
  { value: "silver", label: "🥈 Silver", desc: "Verified zero-waste operations + measurable diversion." },
  { value: "gold", label: "🥇 Gold", desc: "Full closed-loop, third-party audited." },
];

const AdminBusinessApprovals = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [approveTarget, setApproveTarget] = useState(null);
  const [tier, setTier] = useState("bronze");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const isAdmin = typeof window !== "undefined" && localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/businesses`);
      const data = await res.json();
      setBusinesses(Array.isArray(data) ? data : []);
    } catch {
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const submitApprove = async () => {
    if (!approveTarget) return;
    await fetch(`${BASE_URL}/admin/businesses/${approveTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved", certification_tier: tier }),
    });
    setApproveTarget(null);
    setTier("bronze");
    fetchAll();
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    await fetch(`${BASE_URL}/admin/businesses/${rejectTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected", rejection_reason: rejectReason }),
    });
    setRejectTarget(null);
    setRejectReason("");
    fetchAll();
  };

  if (!isAdmin) return null;

  const filtered = filter === "all" ? businesses : businesses.filter((b) => b.status === filter);
  const counts = {
    all: businesses.length,
    pending: businesses.filter((b) => b.status === "pending").length,
    approved: businesses.filter((b) => b.status === "approved").length,
    rejected: businesses.filter((b) => b.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-title py-10 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
          <div>
            <Link to="/businesses" className="text-sm text-zinc-500 hover:text-emerald-400 transition">← Back to Businesses</Link>
            <h1 className="text-3xl font-black text-white mt-1">🌱 Business Approvals</h1>
            <p className="text-zinc-500 text-sm mt-1">Admin Dashboard — Review circular-economy submissions and assign tiers</p>
          </div>
          <Link to="/admin/repair-approvals" className="text-xs text-zinc-400 hover:text-white border border-zinc-800 rounded-full px-3 py-1.5 transition">
            🛠 Repair Queue →
          </Link>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {["pending", "approved", "rejected", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition border ${
                filter === tab
                  ? "bg-emerald-500 text-black border-emerald-500"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} <span className="ml-1 text-xs opacity-70">({counts[tab]})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-zinc-500 py-20">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-zinc-400 text-lg">No {filter === "all" ? "" : filter} submissions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => {
              const style = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
              return (
                <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6">

                  <div className="flex flex-col md:flex-row md:items-start gap-5">
                    {/* Logo / cover */}
                    <div className="w-full md:w-32 h-32 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                      {b.cover_url || b.logo_url ? (
                        <img src={b.cover_url || b.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl text-zinc-600 font-black">{(b.name || "?").charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-lg font-bold text-white">{b.name}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}>{style.label}</span>
                        {b.certification_tier && <CertificationBadge tier={b.certification_tier} size="sm" showTooltip={false} />}
                        <span className="text-[10px] text-zinc-500 ml-auto">#{b.id} • {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>

                      {b.tagline && <p className="text-zinc-300 text-sm mb-2">{b.tagline}</p>}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-zinc-400 mb-3">
                        <p><span className="text-zinc-500">Submitted by:</span> <span className="text-zinc-200">{b.submitted_by}</span></p>
                        <p><span className="text-zinc-500">Category:</span> <span className="text-zinc-200">{b.category}</span></p>
                        {b.city && <p><span className="text-zinc-500">City:</span> <span className="text-zinc-200">{b.city}</span></p>}
                        {b.email && <p><span className="text-zinc-500">Email:</span> <span className="text-zinc-200 break-all">{b.email}</span></p>}
                        {b.phone && <p><span className="text-zinc-500">Phone:</span> <span className="text-zinc-200">{b.phone}</span></p>}
                        {b.website && <p><span className="text-zinc-500">Website:</span> <a href={b.website} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline break-all">{b.website}</a></p>}
                      </div>

                      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 leading-relaxed">
                        {b.description}
                      </div>

                      {b.status === "rejected" && b.rejection_reason && (
                        <div className="mt-3 bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-xs text-red-300">
                          <strong>Rejection note:</strong> {b.rejection_reason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {b.status === "pending" && (
                    <div className="flex gap-3 mt-5 pt-4 border-t border-zinc-800">
                      <button
                        onClick={() => { setApproveTarget(b); setTier("bronze"); }}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full text-sm font-bold transition"
                      >
                        ✅ Approve & Certify
                      </button>
                      <button
                        onClick={() => { setRejectTarget(b); setRejectReason(""); }}
                        className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 rounded-full text-sm font-bold transition"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approve modal */}
      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-white">Assign Certification</h2>
                <p className="text-zinc-500 text-xs mt-0.5">Approving <span className="text-emerald-400 font-semibold">{approveTarget.name}</span></p>
              </div>
              <button onClick={() => setApproveTarget(null)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 mb-5">
              {TIERS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTier(t.value)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition ${
                    tier === t.value
                      ? "bg-emerald-500/10 border-emerald-500/60"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{t.label}</span>
                    {tier === t.value && <span className="text-emerald-400 text-sm">✓ Selected</span>}
                  </div>
                  <p className="text-xs text-zinc-400">{t.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setApproveTarget(null)} className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-sm font-bold transition">Cancel</button>
              <button onClick={submitApprove} className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition">Confirm Approval</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-white">Reject Submission</h2>
                <p className="text-zinc-500 text-xs mt-0.5">{rejectTarget.name}</p>
              </div>
              <button onClick={() => setRejectTarget(null)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white">✕</button>
            </div>

            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-500/50 transition resize-none"
              placeholder="Help the submitter understand why…"
            />

            <div className="flex gap-3 mt-5">
              <button onClick={() => setRejectTarget(null)} className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-sm font-bold transition">Cancel</button>
              <button onClick={submitReject} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-black text-sm transition">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBusinessApprovals;
