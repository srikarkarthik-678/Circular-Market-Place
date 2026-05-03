// ========== AdminRepairApprovals.jsx ==========
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../utils/api";

const statusStyles = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", label: "⏳ Pending" },
  approved: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", label: "✅ Approved" },
  rejected: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", label: "❌ Rejected" },
};

const AdminRepairApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/repair-requests`);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch { setRequests([]); } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    await fetch(`${BASE_URL}/admin/repair-request/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchRequests();
  };

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-title">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link to="/" className="text-sm text-gray-400 hover:text-black">← Back to Explore</Link>
            <h1 className="text-3xl font-bold text-gray-800 mt-1">🛠️ Repair Service Approvals</h1>
            <p className="text-gray-400 text-sm mt-1">Admin Dashboard — Manage incoming repair requests</p>
          </div>
        </div>
        <div className="flex gap-3 mb-6 flex-wrap">
          {["all", "pending", "approved", "rejected"].map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)} className={`px-4 py-2 rounded-full text-sm font-semibold transition border ${filter === tab ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)} <span className="ml-1 text-xs opacity-70">({counts[tab]})</span>
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading requests...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20"><div className="text-5xl mb-4">📭</div><p className="text-gray-400 text-lg">No {filter === "all" ? "" : filter} requests found.</p></div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => {
              const style = statusStyles[req.status] || statusStyles.pending;
              return (
                <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="text-lg font-bold text-gray-800">{req.category}</span>
                        <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>{style.label}</span>
                        <span className="text-xs text-gray-400 ml-auto">#{req.id} • {new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600 mb-4">
                        <p><span className="font-medium text-gray-700">User:</span> {req.username}</p>
                        <p><span className="font-medium text-gray-700">Name:</span> {req.name}</p>
                        <p><span className="font-medium text-gray-700">Phone:</span> {req.phone}</p>
                        <p><span className="font-medium text-gray-700">Address:</span> {req.address}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 border border-gray-100">
                        <span className="font-medium text-gray-700">Problem: </span>{req.problem}
                      </div>
                    </div>
                    {req.image && <img src={req.image} alt="device" className="w-24 h-24 rounded-xl object-cover border flex-shrink-0" />}
                  </div>
                  {req.status === "pending" && (
                    <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                      <button onClick={() => updateStatus(req.id, "approved")} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-semibold transition">✅ Approve</button>
                      <button onClick={() => updateStatus(req.id, "rejected")} className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold transition">❌ Reject</button>
                    </div>
                  )}
                  {req.status !== "pending" && (
                    <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-400">This request has been <strong>{req.status}</strong>. No further action needed.</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRepairApprovals;