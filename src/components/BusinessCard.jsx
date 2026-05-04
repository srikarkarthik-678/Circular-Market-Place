import React from "react";
import { Link } from "react-router-dom";
import CertificationBadge from "./CertificationBadge";

const CATEGORY_LABEL = {
  repair: "🔧 Repair",
  resale: "🛍 Resale",
  upcycling: "✨ Upcycling",
  refurbishing: "🔁 Refurbishing",
  "zero-waste": "🌱 Zero-Waste",
  rental: "📦 Rental",
};

const isValidImageUrl = (s) => typeof s === "string" && /^https?:\/\//i.test(s.trim());

const compact = (n) => {
  const num = Number(n) || 0;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}k`;
  return num.toLocaleString("en-IN");
};

const BusinessCard = ({ business, asLink = true }) => {
  const Wrapper = asLink ? Link : "div";
  const wrapperProps = asLink ? { to: `/businesses/${business.id}` } : {};

  const cover = isValidImageUrl(business.cover_url) ? business.cover_url : isValidImageUrl(business.logo_url) ? business.logo_url : "";
  const validLogo = isValidImageUrl(business.logo_url) ? business.logo_url : "";
  const initial = (business.name || "?").trim().charAt(0).toUpperCase();

  return (
    <Wrapper {...wrapperProps} className="block group">
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 hover:shadow-[0_8px_32px_rgba(16,185,129,0.15)] transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">

        {/* Cover */}
        <div className="relative aspect-[16/9] bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-zinc-700 font-black">
              {initial}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/20 to-transparent pointer-events-none" />

          {business.certification_tier && (
            <div className="absolute top-3 right-3">
              <CertificationBadge tier={business.certification_tier} size="sm" showTooltip={false} />
            </div>
          )}

          {/* Logo chip */}
          <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-2xl bg-zinc-950 border-2 border-zinc-800 shadow-lg flex items-center justify-center overflow-hidden">
            {validLogo ? (
              <img src={validLogo} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <span className="text-emerald-400 font-black text-xl">{initial}</span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 pt-8 flex-1 flex flex-col">
          <h3 className="text-base font-bold text-white leading-tight truncate">{business.name}</h3>
          {business.tagline && (
            <p className="text-zinc-400 text-xs mt-1 line-clamp-2 leading-snug">{business.tagline}</p>
          )}

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="inline-flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
              {CATEGORY_LABEL[business.category] || business.category}
            </span>
            {business.city && (
              <span className="inline-flex items-center text-[10px] text-zinc-400">
                📍 {business.city}
              </span>
            )}
          </div>

          {(business.items_diverted > 0 || business.co2_saved_kg > 0) && (
            <div className="mt-auto pt-3 flex items-center gap-3 text-[11px] text-zinc-300 border-t border-zinc-800 mt-3">
              {business.items_diverted > 0 && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-emerald-400">♻</span>
                  <span className="font-semibold">{compact(business.items_diverted)}</span>
                  <span className="text-zinc-500">items</span>
                </span>
              )}
              {business.co2_saved_kg > 0 && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-emerald-400">🌿</span>
                  <span className="font-semibold">{compact(business.co2_saved_kg)}</span>
                  <span className="text-zinc-500">kg CO₂</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default BusinessCard;
