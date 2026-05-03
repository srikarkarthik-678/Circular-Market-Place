import React, { useEffect, useState } from "react";
import BASE_URL from "../utils/api";
const MySellItems = () => {
  const [items, setItems] = useState([]);
  const username = localStorage.getItem("username");

  useEffect(() => {
    
    fetch(`${BASE_URL}/my-products/${username}`)
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

  const statusConfig = {
    sold: { label: "Sold", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", dot: "bg-red-500" },
    exchanged: { label: "Exchanged", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", dot: "bg-blue-500" },
    active: { label: "Active", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-500" },
  };

  const getStatus = (item) => statusConfig[item.status] || statusConfig.active;

  const stats = {
    total: items.length,
    active: items.filter(i => !i.status || i.status === "active").length,
    sold: items.filter(i => i.status === "sold").length,
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white font-title px-4">
        <div className="text-7xl mb-6">📦</div>
        <h1 className="text-3xl font-black mb-2">No listings yet</h1>
        <p className="text-zinc-500 mb-8">Start selling your pre-loved electronics today.</p>
        <button onClick={() => window.location.href = "/explore/sell"} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 rounded-full transition-all">
          + List a Product
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-title py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">My <span className="text-emerald-400">Listings</span></h1>
            <p className="text-zinc-500 text-sm mt-1">Manage your active and sold items</p>
          </div>
          <button
            onClick={() => window.location.href = "/explore/sell"}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2.5 rounded-full text-sm transition-all w-fit"
          >
            + New Listing
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Total Listed", value: stats.total, color: "text-white" },
            { label: "Active", value: stats.active, color: "text-emerald-400" },
            { label: "Sold", value: stats.sold, color: "text-red-400" },
          ].map(s => (
            <div key={s.label} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-zinc-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => {
            const s = getStatus(item);
            return (
              <div key={item.id} className="group bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

                {/* Image */}
                <div className="relative h-44 bg-zinc-800 overflow-hidden">
                  <img
                    src={item.image || "https://via.placeholder.com/300"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1.5 ${s.bg} border ${s.border} ${s.text} text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h2 className="font-bold text-white truncate">{item.title}</h2>
                  <p className="text-emerald-400 font-black text-xl mt-1">₹{Number(item.price).toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-zinc-600 text-xs">📍</span>
                    <p className="text-zinc-500 text-xs truncate">{item.address}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-600 text-xs">ID #{item.id}</span>
                    <span className={`text-xs font-semibold ${s.text}`}>{s.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MySellItems;