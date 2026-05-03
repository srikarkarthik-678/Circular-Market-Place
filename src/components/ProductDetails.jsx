import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addToCart } from "../utils/cart";
import BASE_URL from "../utils/api";
 
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [username, setUsername] = useState("");
  const [added, setAdded] = useState(false);
 
  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) setUsername(user);
    const fetchProduct = async () => {
      const res = await fetch(`${BASE_URL}/products`);
      const data = await res.json();
      const found = data.find(p => String(p.id) === id);
      setProduct(found);
    };
    fetchProduct();
  }, [id]);
 
  const checkLogin = () => {
    if (!username) { alert("Login required!"); navigate("/login"); return false; }
    return true;
  };
 
  const handleAddToCart = () => {
    if (checkLogin()) { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 2000); }
  };
 
  const reviews = [
    { stars: 4, text: "Really good quality product. Worth every rupee!", author: "Karthik" },
    { stars: 5, text: "Amazing experience, seller was very responsive.", author: "Rahul" },
    { stars: 3, text: "Product is okay but delivery was a bit slow.", author: "Priya" },
  ];
 
  if (!product) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading product...</p>
      </div>
    </div>
  );
 
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-title py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-zinc-600 mb-8">
          <button onClick={() => navigate("/")} className="hover:text-white transition">Home</button>
          <span>/</span>
          <span className="text-zinc-400 truncate max-w-xs">{product.title}</span>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <img src={product.image || "https://via.placeholder.com/500"} alt={product.title} className="w-full h-[420px] object-cover" />
              {product.status === "sold" && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="bg-red-500 text-white font-black text-2xl px-8 py-3 rounded-2xl tracking-widest rotate-[-8deg]">SOLD</span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-zinc-900/80 backdrop-blur border border-zinc-700 text-zinc-300 text-xs px-3 py-1 rounded-full">{product.category}</span>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <h1 className="text-2xl font-black tracking-tight">{product.title}</h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex gap-0.5">{[1,2,3,4].map(i => <span key={i} className="text-amber-400 text-sm">★</span>)}<span className="text-zinc-600 text-sm">★</span></div>
                <span className="text-zinc-500 text-sm">4.0 · 120 reviews</span>
              </div>
              <div className="mt-5 pt-5 border-t border-zinc-800">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Description</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">{product.description}</p>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-5">Customer Reviews</h2>
              <div className="space-y-4">
                {reviews.map((r, i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, j) => (<span key={j} className={`text-xs ${j < r.stars ? "text-amber-400" : "text-zinc-700"}`}>★</span>))}</div>
                      <span className="text-zinc-500 text-xs font-medium">— {r.author}</span>
                    </div>
                    <p className="text-zinc-400 text-sm">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sticky top-8">
              <div className="mb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Price</p>
                <p className="text-4xl font-black text-emerald-400">₹{Number(product.price).toLocaleString('en-IN')}</p>
                <p className="text-xs text-zinc-600 mt-1">Inclusive of all taxes</p>
              </div>
              <div className="mb-5">
                {product.status === "sold" ? (
                  <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-full">🔴 Sold Out</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">✅ Available</span>
                )}
              </div>
              {product.status !== "sold" && (
                <div className="space-y-3">
                  <button onClick={handleAddToCart} className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${added ? "bg-emerald-600 text-white" : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.25)]"}`}>
                    {added ? "✅ Added to Cart!" : "🛒 Add to Cart"}
                  </button>
                  <button onClick={() => checkLogin() && alert("Opening chat...")} className="w-full py-3.5 rounded-xl font-bold text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white transition-all">
                    💬 Chat with Seller
                  </button>
                </div>
              )}
              <div className="mt-6 pt-5 border-t border-zinc-800">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Seller Info</p>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm shrink-0">👤</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{product.seller || "Anonymous"}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">📍 {product.address}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-2">
                {["🔒 Secure", "♻️ Eco", "⚡ Fast", "✅ Verified"].map(b => (
                  <div key={b} className="bg-zinc-900 rounded-lg px-2 py-1.5 text-center text-[10px] text-zinc-500 border border-zinc-800">{b}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default ProductDetails;