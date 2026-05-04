import React, { useEffect, useState } from "react";
import BASE_URL from "../utils/api";
import { Link } from "react-router-dom";

const MySellItems = () => {
  const [items, setItems] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const username = localStorage.getItem("username");

  const fetchItems = () => {
    fetch(`${BASE_URL}/my-products/${username}`)
      .then(res => res.json())
      .then(data => setItems(Array.isArray(data) ? data : []));
  };

  useEffect(() => { fetchItems(); }, []);

  // ── 24-hour window check ──
  const isWithin24hrs = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    return now - created < 24 * 60 * 60 * 1000;
  };

  const getTimeLeft = (createdAt) => {
    if (!createdAt) return null;
    const created = new Date(createdAt).getTime();
    const diff = 24 * 60 * 60 * 1000 - (Date.now() - created);
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m left to edit`;
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setDeletingId(id);
    await fetch(`${BASE_URL}/product/${id}`, { method: "DELETE" });
    setItems(items.filter(p => p.id !== id));
    setDeletingId(null);
  };

  // ── Open edit modal ──
  const openEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      price: item.price,
      phone: item.phone,
      address: item.address,
      description: item.description,
      category: item.category,
      image: item.image,
    });
  };

  // ── Save edit ──
  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      await fetch(`${BASE_URL}/product/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setEditingItem(null);
      fetchItems(); // refresh list from server so Explore also reflects change
    } catch (err) {
      alert("Update failed ❌");
    } finally {
      setEditLoading(false);
    }
  };

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

  const categories = [
    "Mobile Phones", "Laptops", "Refrigerators",
    "Kitchen Applicances", "Washing Machines", "Headphones & Earphones"
  ];

  const inputClass = "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-all";

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

        {/* Back + Header */}
        <div className="mb-4">
          <Link to="/explore" className="text-sm text-zinc-400 hover:text-white transition">← Back to Explore</Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">My <span className="text-emerald-400">Listings</span></h1>
            <p className="text-zinc-500 text-sm mt-1">You can edit or delete items within 24 hours of listing</p>
          </div>
          <button
            onClick={() => window.location.href = "/explore/sell"}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2.5 rounded-full text-sm transition-all w-fit"
          >
            + New Listing
          </button>
        </div>

        {/* Stats */}
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

        {/* 24hr info banner */}
        <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs px-4 py-3 rounded-xl mb-6">
          <span className="text-base">⏱️</span>
          <span>Edit and delete are available for <strong>24 hours</strong> after listing. After that, contact support to make changes.</span>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => {
            const s = getStatus(item);
            const canEdit = isWithin24hrs(item.created_at);
            const timeLeft = getTimeLeft(item.created_at);

            return (
              <div key={item.id} className="group bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all">

                {/* Image */}
                <div className="relative h-44 bg-zinc-800 overflow-hidden">
                  <img
                    src={item.image || "https://via.placeholder.com/300"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1.5 ${s.bg} border ${s.border} ${s.text} text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </div>
                  {/* 24hr badge on image */}
                  {canEdit && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        ✏️ Editable
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h2 className="font-bold text-white truncate">{item.title}</h2>
                  <p className="text-emerald-400 font-black text-xl mt-1">₹{Number(item.price).toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-zinc-600 text-xs">📍</span>
                    <p className="text-zinc-500 text-xs truncate">{item.address}</p>
                  </div>

                  {/* Time left */}
                  {timeLeft && (
                    <p className="text-amber-500/70 text-[10px] mt-2 flex items-center gap-1">
                      ⏳ {timeLeft}
                    </p>
                  )}
                  {!canEdit && (
                    <p className="text-zinc-600 text-[10px] mt-2">🔒 Edit window expired</p>
                  )}

                  {/* Action buttons */}
                  <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-2">
                    <button
                      onClick={() => canEdit && openEdit(item)}
                      disabled={!canEdit}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                        canEdit
                          ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white"
                          : "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed"
                      }`}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => canEdit && handleDelete(item.id)}
                      disabled={!canEdit || deletingId === item.id}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                        canEdit
                          ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed"
                      }`}
                    >
                      {deletingId === item.id ? "⏳ Deleting..." : "🗑 Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── EDIT MODAL ── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-white">Edit Listing</h2>
                <p className="text-zinc-500 text-xs mt-0.5">Changes will appear on Explore instantly</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
              >✕</button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Title</label>
                <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className={inputClass} placeholder="Product title" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Price (₹)</label>
                  <input value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className={inputClass} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Phone</label>
                  <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className={inputClass} placeholder="10 digits" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Address</label>
                <input value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className={inputClass} placeholder="Location" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={3} className={`${inputClass} resize-none`} placeholder="Describe your product..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Category</label>
                <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className={`${inputClass} cursor-pointer`}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Image URL</label>
                <input value={editForm.image} onChange={e => setEditForm({ ...editForm, image: e.target.value })} className={inputClass} placeholder="https://..." />
                {editForm.image && (
                  <img src={editForm.image} alt="preview" className="mt-2 w-full h-28 object-cover rounded-xl border border-zinc-800" />
                )}
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-sm font-bold transition"
              >Cancel</button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {editLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving...
                  </span>
                ) : "Save Changes →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySellItems;
