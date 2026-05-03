// ========== RepairRequests.jsx ==========
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BASE_URL from "../utils/api";
 
const statusStyles2 = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", label: "⏳ Pending" },
  approved: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", label: "✅ Approved" },
  rejected: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", label: "❌ Rejected" },
};
 
const RepairRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username");
 
  useEffect(() => {
    if (!username) return;
    fetch(`${BASE_URL}/repair-requests/${username}`)
      .then((res) => res.json())
      .then((data) => { setRequests(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [username]);
 
  if (!username) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-title">
      <p className="text-xl text-gray-600">Please log in to view your repair requests.</p>
      <Link to="/login" className="mt-4 px-6 py-2 bg-black text-white rounded-full">Log In</Link>
    </div>
  );
 
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-title">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link to="/" className="text-sm text-gray-400 hover:text-black">← Back to Explore</Link>
            <h1 className="text-3xl font-bold text-gray-800 mt-1">🔧 My Repair Requests</h1>
          </div>
          <Link to="/repair" className="px-5 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition">+ New Request</Link>
        </div>
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛠️</div>
            <p className="text-gray-500 text-lg">No repair requests yet.</p>
            <Link to="/repair" className="mt-4 inline-block px-6 py-2 bg-black text-white rounded-full">Book a Repair</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const style = statusStyles2[req.status] || statusStyles2.pending;
              return (
                <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-gray-800">{req.category}</span>
                      <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>{style.label}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1"><span className="font-medium">Problem:</span> {req.problem}</p>
                    <p className="text-gray-500 text-sm"><span className="font-medium">Address:</span> {req.address}</p>
                    <p className="text-gray-500 text-sm"><span className="font-medium">Phone:</span> {req.phone}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {req.image && <img src={req.image} alt="repair" className="w-20 h-20 rounded-xl object-cover border" />}
                    <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default RepairRequests;