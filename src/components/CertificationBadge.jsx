import React from "react";

const TIERS = {
  gold: {
    label: "Gold Certified",
    icon: "🥇",
    gradient: "from-amber-300 via-yellow-400 to-amber-600",
    ring: "ring-amber-400/40",
    text: "text-amber-950",
    tip: "Full closed-loop operations, third-party audited.",
  },
  silver: {
    label: "Silver Certified",
    icon: "🥈",
    gradient: "from-zinc-200 via-slate-300 to-zinc-400",
    ring: "ring-slate-300/40",
    text: "text-slate-900",
    tip: "Verified zero-waste operations with measurable diversion.",
  },
  bronze: {
    label: "Bronze Certified",
    icon: "🥉",
    gradient: "from-orange-300 via-amber-500 to-orange-700",
    ring: "ring-orange-400/40",
    text: "text-orange-950",
    tip: "Recycles or repairs as a core service.",
  },
};

const SIZES = {
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2",
};

const CertificationBadge = ({ tier, size = "md", showTooltip = true, className = "" }) => {
  const t = TIERS[tier];
  if (!t) return null;
  return (
    <div className={`relative group inline-flex ${className}`}>
      <span
        className={`inline-flex items-center font-bold rounded-full bg-gradient-to-r ${t.gradient} ${t.text} ${SIZES[size]} ring-2 ${t.ring} shadow-md whitespace-nowrap`}
      >
        <span className="leading-none">{t.icon}</span>
        <span className="tracking-wide">{t.label}</span>
      </span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-zinc-950 border border-zinc-700 text-zinc-200 text-[11px] leading-snug rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
          {t.tip}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-700" />
        </div>
      )}
    </div>
  );
};

export const tierTooltip = (tier) => TIERS[tier]?.tip || "";
export default CertificationBadge;
