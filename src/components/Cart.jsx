import React, { useEffect, useState } from "react";
import { getCart, updateQuantity, removeFromCart } from "../utils/cart";

const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => { setCart(getCart()); }, []);

  const refreshCart = () => setCart(getCart());

  const changeQty = (id, qty) => {
    if (qty < 1) return;
    updateQuantity(id, qty);
    refreshCart();
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    refreshCart();
  };

  const total = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + price * qty;
  }, 0);

  const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white font-title px-4">
        <div className="text-7xl mb-6">🛒</div>
        <h1 className="text-3xl font-black mb-2">Your cart is empty</h1>
        <p className="text-zinc-500 mb-8">Looks like you haven't added anything yet.</p>
        <button onClick={() => window.location.href = "/"} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 rounded-full transition-all">
          Browse Products →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-title py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">Shopping <span className="text-emerald-400">Cart</span></h1>
          <p className="text-zinc-500 text-sm mt-1">{totalItems} item{totalItems !== 1 ? "s" : ""} in your cart</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Cart Items */}
          <div className="md:col-span-2 space-y-3">
            {cart.map(item => (
              <div key={item.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex gap-4 hover:border-zinc-700 transition-all">

                {/* Image */}
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                  <img
                    src={item.image || "https://via.placeholder.com/150"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-sm text-white truncate">{item.title}</h2>
                  <p className="text-emerald-400 font-black text-lg mt-0.5">₹{Number(item.price).toLocaleString('en-IN')}</p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                      <button
                        onClick={() => changeQty(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition text-lg font-bold"
                      >−</button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => changeQty(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition text-lg font-bold"
                      >+</button>
                    </div>
                    <span className="text-zinc-600 text-xs">
                      Subtotal: <span className="text-white font-semibold">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 text-zinc-500 hover:text-red-400 transition-all text-sm"
                >✕</button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sticky top-8">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="text-white font-semibold">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Delivery</span>
                  <span className="text-emerald-400 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Platform fee</span>
                  <span className="text-emerald-400 font-semibold">₹0</span>
                </div>
              </div>

              <div className="border-t border-zinc-800 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-white">Total</span>
                <span className="text-2xl font-black text-emerald-400">₹{total.toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={() => {
                  localStorage.setItem("checkoutCart", JSON.stringify(cart));
                  window.location.href = "/payment";
                }}
                className="mt-6 w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.2)] text-sm tracking-wide"
              >
                Proceed to Checkout →
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-600">
                <span>🔒</span>
                <span>Secure & encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;