// ========== Repair.jsx ==========
import React, { useState } from "react";
import { Link } from "react-router-dom";
import BASE_URL from "../utils/api";
 
const Repair = () => {
  const [form, setForm] = useState({ name: "", phone: "", address: "", category: "", problem: "", image: "" });
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem("username") || "guest";
 
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/repair-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, username }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Repair request submitted ✅ You can track it under 'Repair Requests'.");
        setForm({ name: "", phone: "", address: "", category: "", problem: "", image: "" });
      } else {
        alert("Something went wrong ❌");
      }
    } catch (err) {
      alert("Server error ❌");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-title">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-4"><Link to="/explore" className="text-sm text-gray-500 hover:text-black">← Back to Explore</Link></div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">🔧 Book a Repair Service</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-2">Select Item Type</label>
            <select name="category" value={form.category} onChange={handleChange} className="w-full border p-3 rounded-lg" required>
              <option value="">Choose category</option>
              <option>Mobile Phone</option>
              <option>Laptop</option>
              <option>Washing Machine</option>
              <option>TV</option>
              <option>Headphones</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">Describe the Issue</label>
            <textarea name="problem" value={form.problem} onChange={handleChange} placeholder="Explain the problem..." className="w-full border p-3 rounded-lg h-28" required />
          </div>
          <div>
            <label className="block font-semibold mb-2">Image URL (Optional)</label>
            <input type="text" name="image" value={form.image} onChange={handleChange} placeholder="Paste an image URL" className="w-full border p-3 rounded-lg" />
          </div>
          <div>
            <label className="block font-semibold mb-2">Address</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Enter your address" className="w-full border p-3 rounded-lg" required />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border p-3 rounded-lg" required />
            </div>
            <div>
              <label className="block font-semibold mb-2">Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full border p-3 rounded-lg" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-black hover:bg-white hover:text-black border border-black text-white py-3 rounded-lg font-semibold text-lg transition">
            {loading ? "Submitting..." : "Book Repair"}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-4">🔒 Verified Technicians • Secure Service</p>
      </div>
    </div>
  );
};
 
export default Repair
