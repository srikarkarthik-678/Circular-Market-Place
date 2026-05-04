import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BASE_URL from "../utils/api";
import CertificationBadge, { tierTooltip } from "./CertificationBadge";

const CATEGORY_LABEL = {
  repair: "🔧 Repair Service",
  resale: "🛍 Resale Shop",
  upcycling: "✨ Upcycling Studio",
  refurbishing: "🔁 Refurbisher",
  "zero-waste": "🌱 Zero-Waste Store",
  rental: "📦 Rental Service",
};

const BusinessDetails = () => {
  const { id } = useParams();
  const [biz, setBiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/businesses/${id}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => { if (d) setBiz(d); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-title flex items-center justify-center">
        <div className="text-zinc-500">Loading…</div>
      </div>
    );
  }

  if (notFound || !biz) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-title flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-4">🌫</div>
        <h1 className="text-2xl font-black">Business not found</h1>
        <p className="text-zinc-500 text-sm mt-2">It may not exist or it's awaiting approval.</p>
        <Link to="/businesses" className="mt-6 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2.5 rounded-full">← Back to all businesses</Link>
      </div>
    );
  }

  const initial = (biz.name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-title">
      {/* Top nav */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6">
        <Link to="/businesses" className="text-sm text-zinc-400 hover:text-emerald-400 transition">← Back to businesses</Link>
      </div>

      {/* Cover */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-4">
        <div className="relative aspect-[21/9] rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-800">
          {biz.cover_url ? (
            <img src={biz.cover_url} alt={biz.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl text-zinc-700 font-black">{initial}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          {biz.certification_tier && (
            <div className="absolute top-5 right-5">
              <CertificationBadge tier={biz.certification_tier} size="lg" showTooltip={false} />
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-12 relative z-10">
        <div className="flex items-end gap-5 flex-wrap">
          <div className="w-24 h-24 rounded-3xl bg-zinc-950 border-2 border-zinc-800 shadow-xl flex items-center justify-center overflow-hidden shrink-0">
            {biz.logo_url ? (
              <img src={biz.logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-emerald-400 font-black text-3xl">{initial}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5 mb-2">
              {CATEGORY_LABEL[biz.category] || biz.category}
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">{biz.name}</h1>
            {biz.tagline && <p className="text-zinc-300 text-base md:text-lg mt-2">{biz.tagline}</p>}
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">

        {/* Main column */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">About</h2>
            <p className="text-zinc-200 text-sm md:text-base leading-relaxed whitespace-pre-line">{biz.description}</p>
          </section>

          {(biz.items_diverted > 0 || biz.co2_saved_kg > 0) && (
            <section className="grid grid-cols-2 gap-4">
              {biz.items_diverted > 0 && (
                <div className="bg-gradient-to-br from-emerald-950 to-zinc-900 border border-emerald-500/20 rounded-2xl p-5">
                  <div className="text-3xl mb-1">♻</div>
                  <div className="text-3xl font-black text-emerald-400">{Number(biz.items_diverted).toLocaleString("en-IN")}</div>
                  <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">Items Diverted</div>
                </div>
              )}
              {biz.co2_saved_kg > 0 && (
                <div className="bg-gradient-to-br from-emerald-950 to-zinc-900 border border-emerald-500/20 rounded-2xl p-5">
                  <div className="text-3xl mb-1">🌍</div>
                  <div className="text-3xl font-black text-emerald-400">{Number(biz.co2_saved_kg).toLocaleString("en-IN")}<span className="text-base text-zinc-400 font-bold ml-1">kg</span></div>
                  <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">CO₂ Saved</div>
                </div>
              )}
            </section>
          )}

          {biz.certification_tier && (
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Certification</h2>
              <div className="flex items-center gap-4">
                <CertificationBadge tier={biz.certification_tier} size="lg" showTooltip={false} />
                <p className="text-zinc-300 text-sm flex-1">{tierTooltip(biz.certification_tier)}</p>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="md:sticky md:top-6 self-start space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 text-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Contact & Location</h3>
            {biz.website && (
              <a href={biz.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 break-all">
                <span>🌐</span><span className="truncate">{biz.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
            {biz.phone && (
              <a href={`tel:${biz.phone}`} className="flex items-center gap-2 text-zinc-200 hover:text-emerald-400">
                <span>📞</span><span>{biz.phone}</span>
              </a>
            )}
            {biz.email && (
              <a href={`mailto:${biz.email}`} className="flex items-center gap-2 text-zinc-200 hover:text-emerald-400 break-all">
                <span>✉</span><span className="truncate">{biz.email}</span>
              </a>
            )}
            {(biz.city || biz.address) && (
              <div className="flex items-start gap-2 text-zinc-200">
                <span>📍</span>
                <span>{[biz.address, biz.city].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {biz.founded_year && (
              <div className="flex items-center gap-2 text-zinc-400">
                <span>📅</span><span>Founded {biz.founded_year}</span>
              </div>
            )}
          </div>

          <Link
            to="/businesses"
            className="block text-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-semibold text-sm px-4 py-3 rounded-2xl transition"
          >
            ← All Businesses
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default BusinessDetails;
