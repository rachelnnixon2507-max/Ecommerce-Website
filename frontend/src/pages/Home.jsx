import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const productRes = await api.get("/api/products");
      const categoryRes = await api.get("/api/categories");
      setProducts(productRes.data);
      setCategories(categoryRes.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col animate-fade-in">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white py-24 sm:py-32">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/25">
            Summer Season Sale Live
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl">
            Premium <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Electronics & Accessories</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed">
            Discover state-of-the-art smartphones, laptops, smartwatches, and accessories curated to elevate your self-study and workflow.
          </p>
          <div className="pt-4 flex flex-wrap gap-4 justify-center sm:justify-start">
            <Link
              to="/products"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-3 px-8 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition duration-200"
            >
              Shop Collection
            </Link>
            <a
              href="#categories"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm py-3 px-8 rounded-xl border border-slate-700 transition duration-200"
            >
              Browse Categories
            </a>
          </div>
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section id="categories" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shop By Category
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Pick from our premium categories to find what fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="group relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition duration-300 aspect-video sm:aspect-[4/3] block"
            >
              {/* Image zoom */}
              <div className="absolute inset-0 bg-slate-100">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
              </div>

              {/* Title badge overlay */}
              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="text-white text-xl font-bold tracking-tight group-hover:translate-x-1.5 transition-transform duration-300 flex items-center gap-1.5">
                  {category.name}
                  <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-baseline gap-3 mb-10 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Top trending devices and premium study tools.
            </p>
          </div>
          <Link
            to="/products"
            className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1 hover:underline"
          >
            View All Catalogue
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* PROMOTION BANNER */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 ring-1 ring-white/25">
            Limited Season Offer
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Elevate Your Study Setup Up To 50% Off
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Get exclusive rates on selected high-performance computing gadgets, active noise cancelling headphones, and modern accessories.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex bg-white hover:bg-slate-50 text-blue-700 font-bold text-sm py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition duration-200"
            >
              Redeem Promotion
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;