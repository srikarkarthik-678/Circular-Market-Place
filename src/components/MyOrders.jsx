import React, { useEffect, useState } from "react";
import BASE_URL from "../utils/api";
const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const username = localStorage.getItem("username");

  useEffect(() => {
      
      fetch(`${BASE_URL}/my-orders/${username}`)
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white font-title px-4">
        <div className="text-7xl mb-6">🧾</div>
        <h1 className="text-3xl font-black mb-2">No orders yet</h1>
        <p className="text-zinc-500 mb-8">Your purchased items will appear here.</p>
        <button onClick={() => window.location.href = "/"} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 rounded-full transition-all">
          Start Shopping →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-title py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">My <span className="text-emerald-400">Orders</span></h1>
          <p className="text-zinc-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
        </div>

        {/* Orders grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((item, index) => (
            <div
              key={item.id}
              className="group bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            >
              {/* Image */}
              <div className="relative h-44 bg-zinc-800 overflow-hidden">
                <img
                  src={item.image || "https://via.placeholder.com/300"}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Order number tag */}
                <div className="absolute top-3 right-3">
                  <span className="bg-zinc-900/80 backdrop-blur border border-zinc-700 text-zinc-400 text-[10px] font-bold px-2 py-1 rounded-full">
                    #{index + 1}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <h2 className="font-bold text-white truncate">{item.title}</h2>
                <p className="text-emerald-400 font-black text-xl mt-1">₹{Number(item.price).toLocaleString('en-IN')}</p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-zinc-600 text-xs">Order ID: #{item.id}</span>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Purchased
                  </span>
                </div>

                {/* Seller info */}
                {item.seller && (
                  <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs">👤</div>
                    <span className="text-zinc-500 text-xs">Seller: <span className="text-zinc-300">{item.seller}</span></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;