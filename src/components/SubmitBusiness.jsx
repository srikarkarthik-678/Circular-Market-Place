import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../utils/api";

const CATEGORIES = [
  { value: "repair", label: "🔧 Repair Service" },
  { value: "resale", label: "🛍 Resale Shop" },
  { value: "upcycling", label: "✨ Upcycling Studio" },
  { value: "refurbishing", label: "🔁 Refurbisher" },
  { value: "zero-waste", label: "🌱 Zero-Waste Store" },
  { value: "rental", label: "📦 Rental Service" },
];

const inputClass =
  "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:bg-zinc-900/80 transition-all";

const labelClass = "block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5";

const Section = ({ title, subtitle, children }) => (
  <fieldset className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 md:p-6">
    <legend className="px-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">{title}</legend>
    {subtitle && <p className="text-zinc-500 text-xs -mt-1 mb-4">{subtitle}</p>}
    <div className="space-y-4">{children}</div>
  </fieldset>
);

const SubmitBusiness = () => {
  const navigate = useNavigate();
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    category: "",
    founded_year: "",
    website: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    items_diverted: "",
    co2_saved_kg: "",
    logo_url: "",
    cover_url: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username) {
      navigate("/login");
      return;
    }
    if (!form.name.trim() || !form.description.trim() || !form.category) {
      setError("Please fill in name, description, and category.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/businesses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          founded_year: form.founded_year ? Number(form.founded_year) : null,
          items_diverted: form.items_diverted ? Number(form.items_diverted) : 0,
          co2_saved_kg: form.co2_saved_kg ? Number(form.co2_saved_kg) : 0,
          submitted_by: username,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Submission failed");

      setToast("✅ Submitted! Our team will review your listing shortly.");
      setTimeout(() => navigate("/businesses"), 1600);
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-title">

      {/* Top bar */}
      <div className="border-b border-zinc-900">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link to="/businesses" className="text-sm text-zinc-400 hover:text-emerald-400 transition">← Back</Link>
          <Link to="/" className="text-lg font-black tracking-tighter text-white font-bat">
            Eco<span className="text-emerald-400">loop</span>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium px-3 py-1 rounded-full mb-3">
          🌱 Apply for Circular Certification
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">List your business</h1>
        <p className="text-zinc-400 text-sm md:text-base mt-2 max-w-xl">
          Submissions are reviewed by our team. Approved businesses are assigned a Bronze, Silver, or Gold tier
          based on the depth of their circular-economy practices.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 md:px-6 mt-8 mb-20 space-y-5">

        {!username && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm rounded-xl p-4">
            You'll need to <Link to="/login" className="underline font-semibold">sign in</Link> before submitting.
          </div>
        )}

        <Section title="Basics" subtitle="What is the business and what does it do?">
          <div>
            <label className={labelClass}>Business Name *</label>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. ReNew Electronics" maxLength={120} />
          </div>
          <div>
            <label className={labelClass}>Tagline</label>
            <input className={inputClass} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="One short line about what you do" maxLength={200} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Category *</label>
              <select className={`${inputClass} cursor-pointer`} value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Founded Year</label>
              <input type="number" min="1800" max="2100" className={inputClass} value={form.founded_year} onChange={(e) => set("founded_year", e.target.value)} placeholder="2018" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Description *</label>
            <textarea rows={5} className={`${inputClass} resize-none`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What you do, who you serve, and what makes you part of the circular economy…" />
          </div>
        </Section>

        <Section title="Contact" subtitle="How can people reach you?">
          <div>
            <label className={labelClass}>Website</label>
            <input className={inputClass} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://your-business.com" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="hello@business.com" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 …" />
            </div>
          </div>
        </Section>

        <Section title="Location">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>City</label>
              <input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Hyderabad" />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, area, pincode" />
            </div>
          </div>
        </Section>

        <Section title="Impact" subtitle="Optional — we'll verify these numbers before approval.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Items Diverted</label>
              <input type="number" min="0" className={inputClass} value={form.items_diverted} onChange={(e) => set("items_diverted", e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>kg CO₂ Saved</label>
              <input type="number" min="0" className={inputClass} value={form.co2_saved_kg} onChange={(e) => set("co2_saved_kg", e.target.value)} placeholder="0" />
            </div>
          </div>
        </Section>

        <Section title="Visuals" subtitle="Paste hosted image URLs (Cloudinary, Imgur, your CDN…).">
          <div>
            <label className={labelClass}>Logo URL</label>
            <input className={inputClass} value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://…/logo.png" />
            {form.logo_url && (
              <img src={form.logo_url} alt="logo preview" className="mt-2 w-20 h-20 rounded-2xl object-cover border border-zinc-800" />
            )}
          </div>
          <div>
            <label className={labelClass}>Cover Image URL</label>
            <input className={inputClass} value={form.cover_url} onChange={(e) => set("cover_url", e.target.value)} placeholder="https://…/cover.jpg" />
            {form.cover_url && (
              <img src={form.cover_url} alt="cover preview" className="mt-2 w-full aspect-[16/9] object-cover rounded-2xl border border-zinc-800" />
            )}
          </div>
        </Section>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl p-3">{error}</div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link to="/businesses" className="flex-1 text-center py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-sm font-bold transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !username}
            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
          >
            {submitting ? "Submitting…" : "Submit for Review →"}
          </button>
        </div>
      </form>

      {/* Success toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black font-bold text-sm px-5 py-3 rounded-full shadow-2xl animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
};

export default SubmitBusiness;
