import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition duration-300">

      <div className="overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-56 object-cover hover:scale-110 transition duration-500"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800";
          }}
        />
      </div>

      <div className="p-5">

        {product.category && (
          <span className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full mb-3">
            {product.category.name}
          </span>
        )}

        <h2 className="text-xl font-bold mb-2">
          {product.name}
        </h2>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center">

          <span className="text-2xl font-bold text-green-600">
            ₹{product.price}
          </span>

          <Link
            to={`/product/${product.id}`}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            View
          </Link>

        </div>

      </div>
    </div>
  );
}

export default ProductCard;