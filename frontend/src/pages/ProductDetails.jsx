import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-slate-500">Loading Product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-rose-600">Product Not Found</h1>
        <p className="text-slate-500 mt-2 mb-6">The requested product could not be located in the database.</p>
        <Link to="/products" className="inline-flex bg-slate-900 text-white font-semibold py-2.5 px-5 rounded-xl transition">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
      {/* Back Button */}
      <div className="mb-6">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Catalogue
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 sm:p-10">
          
          {/* IMAGE */}
          <div className="overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full max-h-[500px] object-contain hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800";
              }}
            />
          </div>

          {/* DETAILS */}
          <div className="flex flex-col justify-between py-2">
            <div>
              {product.category?.name && (
                <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-100">
                  {product.category.name}
                </span>
              )}

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight leading-tight">
                {product.name}
              </h1>

              <p className="text-slate-500 mt-4 text-base leading-relaxed">
                {product.description}
              </p>

              {/* Price & Badge */}
              <div className="flex items-center gap-4 mt-6 mb-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  ₹{product.price.toLocaleString("en-IN")}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/50">
                  20% OFF
                </span>
              </div>

              {/* Specs & Attributes */}
              <div className="border-t border-b border-slate-100 py-5 my-6 space-y-3.5 text-sm">
                
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 w-24">Availability:</span>
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10">
                      {product.stock} items available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-600/10">
                      Out of stock
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 w-24">Product ID:</span>
                  <span className="text-slate-600 font-medium font-mono">#{product.id}</span>
                </div>

                {product.createdDate && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 w-24">Release Date:</span>
                    <span className="text-slate-600 font-medium">
                      {new Date(product.createdDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}

              </div>
            </div>

            {/* Actions Button */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className="flex-1 bg-slate-900 disabled:bg-slate-200 disabled:cursor-not-allowed hover:bg-slate-800 text-white font-semibold py-3.5 px-6 rounded-xl shadow-sm hover:shadow transition duration-200 text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                Add to Cart
              </button>

              <button
                disabled={product.stock <= 0}
                onClick={() => {
                  addToCart(product);
                  alert("Product added to cart! Proceeding to Checkout in demo.");
                }}
                className="flex-1 bg-blue-600 disabled:bg-slate-200 disabled:cursor-not-allowed hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-sm hover:shadow transition duration-200 text-sm flex items-center justify-center gap-2"
              >
                Buy Now
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}

export default ProductDetails;