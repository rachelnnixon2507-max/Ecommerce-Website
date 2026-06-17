import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import ProductCard from "../components/ProductCard";

/* ── Feature badges shown in hero ── */
const HERO_FEATURES = [
  { icon: "🚚", text: "Free Delivery" },
  { icon: "🔒", text: "Secure Payments" },
  { icon: "↩️", text: "Easy Returns" },
  { icon: "⭐", text: "Premium Quality" },
];

/* ── Testimonials ── */
const TESTIMONIALS = [
  { name: "Priya S.", rating: 5, text: "Rachel's Store has the best collection of electronics. Super fast delivery!", avatar: "P" },
  { name: "Arjun M.", rating: 5, text: "Absolutely love the product quality. Will definitely order again!", avatar: "A" },
  { name: "Neha K.", rating: 4, text: "Great prices and a beautiful website experience. Highly recommended.", avatar: "N" },
];

function StarRow({ count }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < count ? "text-amber-400" : "text-slate-200"}>★</span>
      ))}
    </div>
  );
}

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productRes, categoryRes] = await Promise.all([
        api.get("/api/products"),
        api.get("/api/categories"),
      ]);
      setProducts(productRes.data);
      setCategories(categoryRes.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col animate-fade-in">

      {/* ═══════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-rose-950 text-white py-24 sm:py-36">
        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:28px_28px]" />

        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Left: Copy */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              {/* Store badge */}
              <div className="inline-flex items-center gap-2">
                <img src="/logo.png" alt="Rachel's Store" className="w-8 h-8 object-contain animate-float" />
                <span className="text-sm font-bold text-purple-300 tracking-widest uppercase">
                  Rachel's Store
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/25">
                🔥 Summer Sale — Up to 50% Off
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-2xl">
                Premium{" "}
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
                  Electronics
                </span>{" "}
                &{" "}
                <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                  Accessories
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Discover state-of-the-art smartphones, laptops, smartwatches, and accessories — handpicked and curated by Rachel to elevate your everyday life.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white font-bold text-sm py-3.5 px-8 rounded-xl shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition duration-200"
                >
                  Shop Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <a
                  href="#categories"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white font-bold text-sm py-3.5 px-8 rounded-xl border border-white/20 transition duration-200"
                >
                  Browse Categories
                </a>
              </div>

              {/* Feature badges */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
                {HERO_FEATURES.map((f) => (
                  <div key={f.text} className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 border border-white/10">
                    <span>{f.icon}</span>
                    {f.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex-none grid grid-cols-2 gap-4 lg:w-72">
              {[
                { number: "500+", label: "Products", icon: "📦" },
                { number: "10K+", label: "Happy Customers", icon: "😊" },
                { number: "4.9★", label: "Average Rating", icon: "⭐" },
                { number: "24/7", label: "Support", icon: "💬" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center backdrop-blur-sm hover:bg-white/10 transition duration-300"
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <p className="text-2xl font-extrabold text-white">{stat.number}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          CATEGORIES SECTION
      ═══════════════════════════════════ */}
      <section id="categories" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-10 text-center">
          <span className="inline-block px-3 py-1 text-xs font-bold text-purple-700 bg-purple-50 rounded-full border border-purple-100 uppercase tracking-wider mb-3">
            Explore
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Shop By Category
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Pick from our premium categories to find exactly what fits your needs and lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.length === 0 ? (
            // Skeleton loaders
            [...Array(3)].map((_, i) => (
              <div key={i} className="skeleton aspect-video rounded-2xl" />
            ))
          ) : (
            categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 aspect-video block"
              >
                <div className="absolute inset-0 bg-slate-100">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent group-hover:from-purple-950/85 transition-colors duration-300" />
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <h3 className="text-white text-xl font-extrabold tracking-tight group-hover:translate-x-1.5 transition-transform duration-300">
                    {category.name}
                  </h3>
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 border border-white/30">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-baseline gap-3 mb-10 border-b border-slate-100 pb-5">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-bold text-rose-600 bg-rose-50 rounded-full border border-rose-100 uppercase tracking-wider mb-2">
              Trending
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Top-rated devices and premium accessories — loved by customers.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-bold text-sm hover:underline"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton h-72 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════
          WHY CHOOSE US
      ═══════════════════════════════════ */}
      <section className="bg-gradient-to-br from-slate-50 to-purple-50/40 border-y border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Shop at Rachel's Store?
            </h2>
            <p className="text-slate-500 text-sm mt-2">We put customers first — always.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🚚", title: "Free Shipping", desc: "Free delivery on all orders above ₹999 across India." },
              { icon: "🔒", title: "100% Secure", desc: "All transactions are encrypted and protected." },
              { icon: "↩️", title: "Easy Returns", desc: "Hassle-free 30-day return policy, no questions asked." },
              { icon: "🎯", title: "Premium Picks", desc: "Every product is handpicked and quality-verified by Rachel." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-slate-800 text-base mb-1">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          PROMO BANNER
      ═══════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-700 via-fuchsia-600 to-rose-600 text-white py-18">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center px-4 py-16 space-y-5 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white ring-1 ring-white/25">
            ⏰ Limited Time Offer
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Elevate Your Setup — Up To 50% Off
          </h2>
          <p className="text-sm sm:text-base text-purple-100 max-w-xl mx-auto leading-relaxed">
            Get exclusive deals on high-performance gadgets, noise-cancelling headphones, and premium accessories. Only at Rachel's Store.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-purple-700 font-bold text-sm py-3.5 px-8 rounded-xl shadow-xl hover:shadow-2xl transition duration-200"
            >
              Shop the Sale
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 text-xs font-bold text-amber-700 bg-amber-50 rounded-full border border-amber-100 uppercase tracking-wider mb-3">
            Reviews
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            What Our Customers Say
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <StarRow count={t.rating} />
              <p className="text-slate-600 text-sm mt-3 leading-relaxed italic">"{t.text}"</p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-rose-400 flex items-center justify-center text-white font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-400">Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;