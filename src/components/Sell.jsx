import React, { useState } from "react";
import BASE_URL from "../utils/api";
 
const Sell = () => {
  const [form, setForm] = useState({ title: "", price: "", phone: "", address: "", description: "", image: null, category: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
 
  const validate = (name, value) => {
    let error = "";
    if (!value) error = "This field is required";
    if (name === "price") { if (!/^\d+$/.test(value)) error = "Only numbers allowed"; else if (Number(value) <= 0) error = "Price must be greater than 0"; }
    if (name === "phone") { if (!/^\d+$/.test(value)) error = "Only numbers allowed"; else if (value.length !== 10) error = "Must be 10 digits"; }
    return error;
  };
 
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
      setErrors({ ...errors, image: files[0] ? "" : "Image is required" });
      if (files[0]) setPreview(URL.createObjectURL(files[0]));
      return;
    }
    if ((name === "phone" || name === "price") && !/^\d*$/.test(value)) return;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: validate(name, value) });
  };
 
  const isFormValid = form.title && form.price && form.phone && form.address && form.description && form.image && form.category && Object.values(errors).every((err) => !err);
 
  const uploadImage = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "circular");
    const res = await fetch("https://api.cloudinary.com/v1_1/dmgwktyqn/image/upload", { method: "POST", body: data });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error?.message || "Upload failed");
    return result.secure_url;
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;
    try {
      setLoading(true);
      const imageUrl = await uploadImage(form.image);
      const username = localStorage.getItem("username");
      const productData = { ...form, image: imageUrl, seller: username };
      const res = await fetch(`${BASE_URL}/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!res.ok) throw new Error();
      alert("Product Added Successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };
 
  const inputBase = "w-full bg-zinc-900 border rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all";
  const inputClass = (field) => `${inputBase} ${errors[field] ? "border-red-500 focus:ring-red-500" : "border-zinc-800 focus:ring-emerald-500 focus:border-emerald-500"}`;
  const categories = ["Mobile Phones", "Laptops", "Refrigerators", "Kitchen Applicances", "Washing Machines", "Headphones & Earphones"];
 
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-title flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full mb-4">♻️ List your item</div>
          <h1 className="text-4xl font-black tracking-tight">Sell a <span className="text-emerald-400">Product</span></h1>
          <p className="text-zinc-500 mt-2 text-sm">Fill in the details below. Your listing goes live instantly.</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Product Title</label>
              <input name="title" placeholder="e.g. iPhone 13 Pro 256GB" value={form.title} onChange={handleChange} className={inputClass("title")} />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-bold">₹</span>
                  <input name="price" placeholder="0" value={form.price} onChange={handleChange} className={`${inputClass("price")} pl-8`} />
                </div>
                {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Phone</label>
                <input name="phone" placeholder="10-digit number" value={form.phone} onChange={handleChange} maxLength={10} className={inputClass("phone")} />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Address</label>
              <input name="address" placeholder="Your location" value={form.address} onChange={handleChange} className={inputClass("address")} />
              {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea name="description" placeholder="Describe your product..." value={form.description} onChange={handleChange} rows={4} className={`${inputClass("description")} resize-none`} />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={`${inputClass("category")} cursor-pointer`}>
                <option value="">Select a category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Product Image</label>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all h-36 ${errors.image ? "border-red-500" : "border-zinc-700 hover:border-emerald-500"}`}>
                {preview ? (<img src={preview} alt="preview" className="h-full w-full object-cover rounded-xl" />) : (
                  <div className="text-center"><div className="text-3xl mb-2">📸</div><p className="text-zinc-500 text-sm">Click to upload image</p><p className="text-zinc-600 text-xs mt-1">JPG, PNG, WEBP</p></div>
                )}
                <input type="file" name="image" onChange={handleChange} className="hidden" accept="image/*" />
              </label>
              {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
            </div>
            <button type="submit" disabled={!isFormValid || loading} className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all ${!isFormValid || loading ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.3)]"}`}>
              {loading ? (<span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Uploading...</span>) : "List Product →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
 
export default Sell;