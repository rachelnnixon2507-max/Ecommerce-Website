import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">

      {/* Product Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-purple-50/30 aspect-square max-h-56">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800";
          }}
        />

        {/* Category badge */}
        {product.category?.name && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/95 text-purple-700 shadow-sm border border-purple-100">
            {product.category.name}
          </span>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick view overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Body Details */}
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-purple-700 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Stock indicator */}
        {!isOutOfStock && product.stock <= 5 && (
          <p className="text-[10px] font-semibold text-orange-600 mt-2">
            Only {product.stock} left!
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Price</span>
            <span className="text-xl font-extrabold text-slate-900">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            onClick={() => {
              if (isOutOfStock) return;
              if (!isAuthenticated()) {
                alert("Please login to add products to your cart.");
                return;
              }
              addToCart(product);
            }}
            disabled={isOutOfStock}
            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
            className="bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 disabled:from-slate-200 disabled:to-slate-200 disabled:cursor-not-allowed text-white disabled:text-slate-400 text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm shadow-purple-200 hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;