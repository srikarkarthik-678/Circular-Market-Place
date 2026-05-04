import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../utils/api";
import BusinessCard from "./BusinessCard";
import CertificationBadge, { tierTooltip } from "./CertificationBadge";

const CATEGORIES = [
  { value: "all", label: "All", icon: "✨" },
  { value: "repair", label: "Repair", icon: "🔧" },
  { value: "resale", label: "Resale", icon: "🛍" },
  { value: "upcycling", label: "Upcycling", icon: "♻" },
  { value: "refurbishing", label: "Refurbish", icon: "🔁" },
  { value: "zero-waste", label: "Zero-Waste", icon: "🌱" },
  { value: "rental", label: "Rental", icon: "📦" },
];

const TIERS = [
  { value: "all", label: "All Tiers" },
  { value: "gold", label: "🥇 Gold" },
  { value: "silver", label: "🥈 Silver" },
  { value: "bronze", label: "🥉 Bronze" },
];

// Animated counter — counts up from 0 to `value` over ~1.2s
const Counter = ({ value, suffix = "" }) => {
  const [n, setN] = useState(0);
  const startRef = useRef(null);
  const target = Number(value) || 0;

  useEffect(() => {
    let raf;
    const duration = 1200;
    const tick = (t) => {
      if (!startRef.current) startRef.current = t;
      const progress = Math.min((t - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setN(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return <span>{n.toLocaleString("en-IN")}{suffix}</span>;
};

const Businesses = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({ verified: 0, items_diverted: 0, co2_saved: 0, cities: 0 });
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Filter state
  const [verifiedOnly, setVerifiedOnly] = useState(true); // the "toggle" the user asked for
  const [category, setCategory] = useState("all");
  const [tier, setTier] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [legendOpen, setLegendOpen] = useState(false);

  const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;
  const isAdmin = typeof window !== "undefined" && localStorage.getItem("isAdmin") === "true";

  // Fetch stats once
  useEffect(() => {
    fetch(`${BASE_URL}/businesses/stats/summary`)
      .then((r) => r.json())
      .then((d) => setStats(d || {}))
      .catch(() => {});
  }, []);

  // Fetch businesses (debounced on filter changes)
  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (tier !== "all") params.set("tier", tier);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    const qs = params.toString();

    setLoading(true);
    const t = setTimeout(() => {
      fetch(`${BASE_URL}/businesses${qs ? `?${qs}` : ""}`)
        .then((r) => r.json())
        .then((d) => setBusinesses(Array.isArray(d) ? d : []))
        .catch(() => setBusinesses([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [category, tier, searchQuery]);

  // Sticky nav shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The "All vs Verified Circular Only" toggle filters in-memory.
  // Public API only ever returns approved businesses, so "Verified" = those with a tier.
  const visible = useMemo(() => {
    return verifiedOnly ? businesses.filter((b) => !!b.certification_tier) : businesses;
  }, [businesses, verifiedOnly]);

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  const scrollToGrid = () => {
    document.getElementById("businesses-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-title">

      {/* ── NAVBAR ── (mirrors Explore.jsx style) */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06)]" : "bg-[#0a0a0a]"}`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter text-white shrink-0 font-bat">
            Eco<span className="text-emerald-400">loop</span>
          </Link>

          <div className="hidden md:flex items-center gap-2 ml-2 text-xs">
            <Link to="/explore" className="px-3 py-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition">Explore</Link>
            <Link to="/businesses" className="px-3 py-1.5 rounded-full text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 font-semibold">🌱 Businesses</Link>
            <Link to="/repair" className="px-3 py-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition">Repair</Link>
          </div>

          <div className="flex-1" />

          <Link to="/businesses/submit" className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-3 py-2 rounded-full transition-all shrink-0">
            + List Business
          </Link>
          {username ? (
            <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400">
              <span className="text-white font-semibold">{username}</span>
              <button onClick={handleSignOut} className="text-red-400 hover:text-red-300">Sign out</button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:inline-flex text-xs text-zinc-400 hover:text-white">Sign In</Link>
          )}
          {isAdmin && (
            <Link to="/admin/businesses" className="hidden md:inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-semibold px-2 py-1 rounded-full">
              👑 Admin Queue
            </Link>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-[88px]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6 md:pt-10">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-emerald-950 via-zinc-950 to-zinc-900 p-8 md:p-14">
            {/* Decorative glows */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium px-3 py-1 rounded-full mb-5">
                ♻️ Powering the Circular Economy
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05]">
                Businesses giving things <span className="text-emerald-400">a second life.</span>
              </h1>
              <p className="text-zinc-300 text-sm md:text-lg mt-4 max-w-2xl leading-relaxed">
                A trusted directory of repair shops, refurbishers, upcyclers, and zero-waste stores.
                Toggle to see only the verified ones — and apply if you're one of them.
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <button
                  onClick={scrollToGrid}
                  className="bg-white hover:bg-zinc-100 text-black font-bold text-sm px-5 py-3 rounded-full transition shadow-lg"
                >
                  Browse Businesses →
                </button>
                <Link
                  to="/businesses/submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-5 py-3 rounded-full transition shadow-lg"
                >
                  + List Your Business
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT STATS ── */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 mt-8 md:mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Verified Businesses", value: stats.verified || 0, icon: "🌿", suffix: "" },
            { label: "Items Diverted", value: stats.items_diverted || 0, icon: "♻", suffix: "" },
            { label: "kg CO₂ Saved", value: stats.co2_saved || 0, icon: "🌍", suffix: "" },
            { label: "Cities Covered", value: stats.cities || 0, icon: "📍", suffix: "" },
          ].map((s) => (
            <div key={s.label} className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-5 hover:border-emerald-500/30 transition group">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
              <div className="relative">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  <Counter value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[11px] md:text-xs text-zinc-500 mt-1 uppercase tracking-wider font-medium">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FILTER BAR (the toggle the user asked for) ── */}
      <section id="businesses-grid" className="sticky top-[64px] z-30 mt-10 bg-[#0a0a0a]/90 backdrop-blur-md border-y border-zinc-900">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 flex flex-col gap-3">

          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Primary segmented toggle */}
            <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 rounded-full p-1 text-xs font-semibold">
              <button
                onClick={() => setVerifiedOnly(false)}
                className={`px-4 py-2 rounded-full transition-all ${!verifiedOnly ? "bg-white text-black shadow-md" : "text-zinc-400 hover:text-white"}`}
              >
                All Businesses
              </button>
              <button
                onClick={() => setVerifiedOnly(true)}
                className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${verifiedOnly ? "bg-emerald-500 text-black shadow-[0_0_16px_rgba(16,185,129,0.4)]" : "text-zinc-400 hover:text-white"}`}
              >
                <span>♻️</span> Verified Circular Only
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search by name, tagline, mission..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            <button
              onClick={() => setLegendOpen((v) => !v)}
              className="text-xs text-zinc-400 hover:text-emerald-400 transition flex items-center gap-1.5 shrink-0"
            >
              <span>{legendOpen ? "▾" : "▸"}</span> What do badges mean?
            </button>
          </div>

          {/* Tier chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold shrink-0 mr-1">Tier:</span>
            {TIERS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTier(t.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                  tier === t.value
                    ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                    : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}

            <div className="w-px h-5 bg-zinc-800 mx-2 shrink-0" />

            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold shrink-0 mr-1">Type:</span>
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                  category === c.value
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
                }`}
              >
                <span className="mr-1">{c.icon}</span>{c.label}
              </button>
            ))}
          </div>

          {/* Collapsible legend */}
          {legendOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {["bronze", "silver", "gold"].map((t) => (
                <div key={t} className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                  <CertificationBadge tier={t} size="sm" showTooltip={false} />
                  <p className="text-xs text-zinc-400 leading-snug">{tierTooltip(t)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── GRID ── */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg md:text-xl font-bold text-white">
            {verifiedOnly ? "Verified Circular Businesses" : "All Listed Businesses"}
            <span className="ml-2 text-sm font-normal text-zinc-500">({visible.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[16/9] bg-zinc-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-2/3" />
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/50 border border-dashed border-zinc-800 rounded-3xl">
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-zinc-300 text-lg font-semibold">No businesses match your filters yet.</p>
            <p className="text-zinc-500 text-sm mt-1 max-w-md">
              {verifiedOnly
                ? "Try turning off 'Verified Circular Only' to see all listed businesses, or be the first to apply."
                : "Be the first to put a business on the map."}
            </p>
            <Link to="/businesses/submit" className="mt-5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-5 py-3 rounded-full transition">
              + List Your Business
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visible.map((b) => <BusinessCard key={b.id} business={b} />)}
          </div>
        )}
      </section>

      {/* ── CTA STRIP ── */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 p-8 md:p-10 text-center">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(16,185,129,0.6) 0%, transparent 50%)" }} />
          <div className="relative">
            <h3 className="text-2xl md:text-3xl font-black text-white">Run a circular-economy business?</h3>
            <p className="text-zinc-300 text-sm md:text-base mt-2 max-w-xl mx-auto">
              Get featured here. Submissions are reviewed by our team and assigned a Bronze, Silver, or Gold tier.
            </p>
            <Link to="/businesses/submit" className="inline-block mt-5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-6 py-3 rounded-full transition shadow-xl">
              Apply for Certification →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Businesses;
