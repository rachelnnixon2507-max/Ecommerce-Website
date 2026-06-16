import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300 flex flex-col h-full">
      
      {/* Product Image */}
      <div className="relative overflow-hidden bg-slate-50 aspect-video sm:aspect-square max-h-56">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800";
          }}
        />
        {product.category?.name && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/95 text-slate-800 shadow-sm border border-slate-100">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Body Details */}
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/product/${product.id}`} className="block group-hover:text-blue-600">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Price</span>
            <span className="text-xl font-extrabold text-slate-900">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-sm hover:shadow transition duration-200 flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add
          </button>
        </div>

      </div>
    </div>
  );
}

export default ProductCard;