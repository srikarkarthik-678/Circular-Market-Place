import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import BASE_URL from '../utils/api';

const Explore = () => {
    const navigate = useNavigate();
    const [Category, setCategory] = useState("All")
    const [products, setProducts] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [username, setUsername] = useState("")
    const [scrolled, setScrolled] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

    // ── Admin edit modal state ──
    const [editingItem, setEditingItem] = useState(null)
    const [editForm, setEditForm] = useState({})
    const [editLoading, setEditLoading] = useState(false)

    const isAdmin = localStorage.getItem("isAdmin") === "true";

    const filteredProducts =
        Category === "All"
            ? products
            : products.filter((item) => item.category === Category);

    const updateStatus = async (id, status) => {
        await fetch(`${BASE_URL}/product-status/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        await fetchProducts();
    };

    const fetchProducts = async () => {
        const res = await fetch(`${BASE_URL}/products`);
        const data = await res.json();
        setProducts(data);
    };

    useEffect(() => { fetchProducts(); }, [])

    useEffect(() => {
        const storedUser = localStorage.getItem("username");
        if (storedUser) setUsername(storedUser);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchSearch = async () => {
            try {
                let data;
                if (searchQuery.trim() === "") {
                    const res = await fetch(`${BASE_URL}/products`);
                    data = await res.json();
                } else {
                    const res = await fetch(`${BASE_URL}/search?q=${searchQuery}`);
                    data = await res.json();
                }
                if (Array.isArray(data)) setProducts(data);
                else setProducts([]);
            } catch (err) {
                console.error("Search error:", err);
                setProducts([]);
            }
        };
        const delayDebounce = setTimeout(fetchSearch, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        setDeletingId(id);
        await fetch(`${BASE_URL}/product/${id}`, { method: "DELETE" });
        setProducts(products.filter(p => p.id !== id));
        setDeletingId(null);
    };

    // ── Open inline edit modal ──
    const openEdit = (item) => {
        setEditingItem(item);
        setEditForm({
            title: item.title,
            price: item.price,
            phone: item.phone,
            address: item.address,
            description: item.description,
            category: item.category,
            image: item.image,
        });
    };

    // ── Save edit ──
    const handleEditSave = async () => {
        setEditLoading(true);
        try {
            await fetch(`${BASE_URL}/product/${editingItem.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            setEditingItem(null);
            await fetchProducts(); // refresh grid instantly
        } catch (err) {
            alert("Update failed ❌");
        } finally {
            setEditLoading(false);
        }
    };

    const handleSignOut = () => {
        localStorage.clear();
        setUsername("");
        navigate("/login");
    };

    const categories = [
        { label: "All", value: "All" },
        { label: "📱 Mobiles", value: "Mobile Phones" },
        { label: "💻 Laptops", value: "Laptops" },
        { label: "📺 TV & Audio", value: "TV's Video-Audio" },
        { label: "🍳 Kitchen", value: "Kitchen Applicances" },
        { label: "🎧 Headphones", value: "Headphones & Earphones" },
        { label: "🫧 Washing", value: "Washing Machines" },
    ];

    const productCategories = [
        "Mobile Phones", "Laptops", "Refrigerators",
        "Kitchen Applicances", "Washing Machines", "Headphones & Earphones"
    ];

    const inputClass = "w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-all";

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-title">

            {/* ─── NAVBAR ─── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06)]" : "bg-[#0a0a0a]"}`}>

                <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
                    <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter text-white shrink-0 font-bat">
                        Eco<span className="text-emerald-400">loop</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1 text-xs text-zinc-400 border border-zinc-800 rounded-full px-3 py-1.5 shrink-0">
                        <span>📍</span>
                        <select className="bg-transparent text-zinc-300 cursor-pointer outline-none text-xs">
                            <option>Hyderabad</option>
                            <option>Chennai</option>
                            <option>Bangalore</option>
                            <option>Karnataka</option>
                        </select>
                    </div>

                    <div className="flex-1 relative hidden sm:block">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder="Search for products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:bg-zinc-800 transition-all"
                        />
                    </div>

                    <button
                        onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                        className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0"
                    >🔍</button>

                    <div className="hidden md:flex items-center gap-1 shrink-0">
                        <div className="relative group">
                            <button className="flex flex-col items-center px-2.5 py-1.5 rounded-xl hover:bg-zinc-900 transition">
                                <span className="text-base">👤</span>
                                <span className="text-[9px] text-zinc-400 group-hover:text-white transition mt-0.5 max-w-[60px] truncate">
                                    {username || "Sign In"}
                                </span>
                            </button>
                            <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl min-w-[170px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                {username ? (
                                    <>
                                        <div className="px-4 py-3 text-xs text-zinc-400 border-b border-zinc-800">
                                            Signed in as <span className="text-white font-semibold">{username}</span>
                                        </div>
                                        <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded-b-xl transition">
                                            🚪 Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition">
                                        👤 Sign In
                                    </Link>
                                )}
                            </div>
                        </div>

                        <Link to="/explore/sell" className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-3 py-2 rounded-full transition-all">
                            + Sell
                        </Link>

                        <div className="relative group">
                            <button className="flex flex-col items-center px-2.5 py-1.5 rounded-xl hover:bg-zinc-900 transition">
                                <span className="text-base">🔧</span>
                                <span className="text-[9px] text-zinc-400 group-hover:text-white transition mt-0.5">Repair</span>
                            </button>
                            <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl min-w-[180px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <Link to="/repair" className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-t-xl transition">🔧 Book Repair</Link>
                                <Link to="/repair-requests" className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition">📋 My Requests</Link>
                                {isAdmin && (
                                    <Link to="/admin/repair-approvals" className="flex items-center gap-2 px-4 py-3 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-zinc-800 rounded-b-xl transition border-t border-zinc-800">🛠 Repair Approvals</Link>
                                )}
                            </div>
                        </div>

                        <Link to="/cart" className="flex flex-col items-center px-2.5 py-1.5 rounded-xl hover:bg-zinc-900 transition group">
                            <span className="text-base">🛒</span>
                            <span className="text-[9px] text-zinc-400 group-hover:text-white transition mt-0.5">Cart</span>
                        </Link>
                        <Link to="/my-products" className="flex flex-col items-center px-2.5 py-1.5 rounded-xl hover:bg-zinc-900 transition group">
                            <span className="text-base">📦</span>
                            <span className="text-[9px] text-zinc-400 group-hover:text-white transition mt-0.5">My Items</span>
                        </Link>
                        <Link to="/my-orders" className="flex flex-col items-center px-2.5 py-1.5 rounded-xl hover:bg-zinc-900 transition group">
                            <span className="text-base">🧾</span>
                            <span className="text-[9px] text-zinc-400 group-hover:text-white transition mt-0.5">Orders</span>
                        </Link>
                        {isAdmin && (
                            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-semibold px-2 py-1 rounded-full">
                                👑 Admin
                            </div>
                        )}
                    </div>

                    <div className="flex md:hidden items-center gap-2 ml-auto shrink-0">
                        <Link to="/explore/sell" className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-3 py-2 rounded-full transition-all">
                            + Sell
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="flex flex-col gap-1 w-9 h-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800"
                        >
                            <span className={`block w-4 h-0.5 bg-white transition-all ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
                            <span className={`block w-4 h-0.5 bg-white transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
                            <span className={`block w-4 h-0.5 bg-white transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
                        </button>
                    </div>
                </div>

                {mobileSearchOpen && (
                    <div className="sm:hidden px-4 pb-3">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                            />
                        </div>
                    </div>
                )}

                {mobileMenuOpen && (
                    <div className="md:hidden bg-zinc-950 border-t border-zinc-800 px-4 py-4 space-y-1">
                        {username ? (
                            <div className="px-3 py-2 text-xs text-zinc-400 border-b border-zinc-800 mb-2">
                                Signed in as <span className="text-white font-semibold">{username}</span>
                            </div>
                        ) : (
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-900 transition text-sm text-zinc-300 hover:text-white">
                                <span>👤</span> Sign In
                            </Link>
                        )}
                        <Link to="/repair" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-900 transition text-sm text-zinc-300 hover:text-white"><span>🔧</span> Book Repair</Link>
                        <Link to="/repair-requests" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-900 transition text-sm text-zinc-300 hover:text-white"><span>📋</span> My Repair Requests</Link>
                        <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-900 transition text-sm text-zinc-300 hover:text-white"><span>🛒</span> Cart</Link>
                        <Link to="/my-products" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-900 transition text-sm text-zinc-300 hover:text-white"><span>📦</span> My Listings</Link>
                        <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-900 transition text-sm text-zinc-300 hover:text-white"><span>🧾</span> My Orders</Link>
                        {isAdmin && <Link to="/admin/repair-approvals" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-900 transition text-sm text-emerald-400"><span>🛠</span> Repair Approvals</Link>}
                        {isAdmin && <div className="flex items-center gap-2 px-3 py-2"><span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full">👑 Admin Mode</span></div>}
                        {username && (
                            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-900 transition text-sm text-red-400 border-t border-zinc-800 mt-2">
                                <span>🚪</span> Sign Out
                            </button>
                        )}
                    </div>
                )}

                <div className="border-t border-zinc-900">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setCategory(cat.value)}
                                className={`shrink-0 px-3 md:px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${Category === cat.value
                                    ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                                    : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* ─── HERO ─── */}
            <div className="pt-[130px] md:pt-[120px]">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-4 md:pb-6">
                    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950 border border-zinc-800 p-6 md:p-10">
                        <div className="absolute top-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                        <div className="relative">
                            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full mb-3">
                                ♻️ Sustainable Marketplace
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
                                Buy. Sell. <span className="text-emerald-400">Repair.</span>
                            </h1>
                            <p className="text-zinc-400 text-sm md:text-lg max-w-xl">
                                Give electronics a second life. Shop preloved gadgets or list yours in minutes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── PRODUCT GRID ─── */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 pb-20">
                <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-2">
                    <h2 className="text-lg md:text-xl font-bold text-white">
                        New Recommendations
                        <span className="ml-2 text-sm font-normal text-zinc-500">({filteredProducts.length} items)</span>
                    </h2>
                    {isAdmin && (
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-full">
                            👑 Hover cards to manage
                        </div>
                    )}
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="text-5xl mb-4">📭</div>
                        <p className="text-zinc-400 text-lg">No products found.</p>
                        <p className="text-zinc-600 text-sm mt-1">Try a different category or search term.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                        {Array.isArray(filteredProducts) && filteredProducts.map((item) => (
                            <div key={item.id} className="group relative">

                                {/* ── ADMIN OVERLAY ── */}
                                {isAdmin && (
                                    <div className="absolute inset-0 z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                        <div className="absolute inset-0 bg-black/55 rounded-2xl backdrop-blur-[1px]" />
                                        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-20">
                                            {/* ✅ Now opens inline modal instead of redirecting */}
                                            <button
                                                onClick={(e) => { e.preventDefault(); openEdit(item); }}
                                                className="flex items-center gap-1 bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-600 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition shadow-lg"
                                            >✏️ Edit</button>
                                            <button
                                                onClick={(e) => { e.preventDefault(); handleDelete(item.id); }}
                                                disabled={deletingId === item.id}
                                                className="flex items-center gap-1 bg-red-600/90 hover:bg-red-500 border border-red-500/40 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition shadow-lg disabled:opacity-50"
                                            >{deletingId === item.id ? "⏳" : "🗑 Delete"}</button>
                                        </div>
                                        <div className="absolute bottom-[50px] left-2 right-2 flex gap-1 z-20">
                                            <button onClick={(e) => { e.preventDefault(); updateStatus(item.id, "available"); }} className={`flex-1 text-[9px] font-bold py-1.5 rounded-lg border transition-all ${item.status !== "sold" ? "bg-emerald-500 text-black border-emerald-400" : "bg-zinc-800/80 text-zinc-400 border-zinc-700"}`}>✅ Available</button>
                                            <button onClick={(e) => { e.preventDefault(); updateStatus(item.id, "sold"); }} className={`flex-1 text-[9px] font-bold py-1.5 rounded-lg border transition-all ${item.status === "sold" ? "bg-red-500 text-white border-red-400" : "bg-zinc-800/80 text-zinc-400 border-zinc-700"}`}>🔴 Sold</button>
                                        </div>
                                    </div>
                                )}

                                {/* ── PRODUCT CARD ── */}
                                {item.status === "sold" ? (
                                    <div className="cursor-not-allowed">
                                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden opacity-60">
                                            <div className="relative overflow-hidden aspect-square bg-zinc-800">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale" />
                                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
                                                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">SOLD</span>
                                                    <span className="text-zinc-300 text-[9px]">No longer available</span>
                                                </div>
                                            </div>
                                            <div className="p-2.5">
                                                <h3 className="text-xs font-semibold text-zinc-500 truncate line-through">{item.title}</h3>
                                                <p className="text-zinc-600 font-bold text-sm mt-0.5">₹{Number(item.price).toLocaleString('en-IN')}</p>
                                                <p className="text-zinc-600 text-[10px] mt-0.5 truncate">📍 {item.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link to={`/product/${item.id}`}>
                                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1">
                                            <div className="relative overflow-hidden aspect-square bg-zinc-800">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="p-2.5 md:p-3">
                                                <h3 className="text-xs md:text-sm font-semibold text-white truncate leading-snug">{item.title}</h3>
                                                <p className="text-emerald-400 font-bold text-sm md:text-base mt-0.5">₹{Number(item.price).toLocaleString('en-IN')}</p>
                                                <p className="text-zinc-500 text-[10px] md:text-xs mt-0.5 truncate">📍 {item.address}</p>
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── ADMIN EDIT MODAL ── */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">

                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-black text-white">Edit Product</h2>
                                <p className="text-zinc-500 text-xs mt-0.5">Changes reflect on Explore instantly</p>
                            </div>
                            <button
                                onClick={() => setEditingItem(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
                            >✕</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Title</label>
                                <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className={inputClass} placeholder="Product title" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Price (₹)</label>
                                    <input value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className={inputClass} placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Phone</label>
                                    <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className={inputClass} placeholder="10 digits" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Address</label>
                                <input value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className={inputClass} placeholder="Location" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
                                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={3} className={`${inputClass} resize-none`} placeholder="Describe your product..." />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Category</label>
                                <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className={`${inputClass} cursor-pointer`}>
                                    <option value="">Select category</option>
                                    {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Image URL</label>
                                <input value={editForm.image} onChange={e => setEditForm({ ...editForm, image: e.target.value })} className={inputClass} placeholder="https://..." />
                                {editForm.image && (
                                    <img src={editForm.image} alt="preview" className="mt-2 w-full h-28 object-cover rounded-xl border border-zinc-800" />
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditingItem(null)}
                                className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-sm font-bold transition"
                            >Cancel</button>
                            <button
                                onClick={handleEditSave}
                                disabled={editLoading}
                                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {editLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Saving...
                                    </span>
                                ) : "Save Changes →"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Explore;
