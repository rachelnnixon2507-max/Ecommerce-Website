import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";

const ITEMS_PER_PAGE = 8;

function Products() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products");
      setProducts(res.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let data = [...products];

    // Category Filter
    if (id) {
      data = data.filter((product) => product.categoryId === Number(id));
    }

    // Search Filter
    if (search) {
      data = data.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    if (sort === "low-high") {
      data.sort((a, b) => a.price - b.price);
    }
    if (sort === "high-low") {
      data.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(data);
    setCurrentPage(1); // Reset page on filter change
  }, [products, search, sort, id]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const categoryName =
    filteredProducts.length > 0 ? filteredProducts[0]?.category?.name : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {id ? `${categoryName || "Category"} Products` : "Browse Products"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore our handpicked premium goods and electronics catalogue.
        </p>
      </div>

      {/* Modern Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search our electronics catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 bg-white pl-11 pr-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
          />
        </div>

        {/* Sort Select */}
        <div className="w-full md:w-56">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full border border-slate-200 bg-white px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
          >
            <option value="">Sort By default</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>

      </div>

      {/* Results Header */}
      <div className="mb-6 flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span>{filteredProducts.length} items found</span>
      </div>

      {/* Products Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 animate-pulse">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            No Products Found
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Try adjusting your search criteria or selecting another category.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

    </div>
  );
}

export default Products;