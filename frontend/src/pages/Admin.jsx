import { useEffect, useState } from "react";
import api from "../api/api";
import Pagination from "../components/Pagination";

const ITEMS_PER_PAGE = 10;

/* ── Status badge colours ── */
const STATUS_STYLES = {
  Pending:   "bg-orange-100 text-orange-700 ring-orange-400/20",
  Shipped:   "bg-blue-100 text-blue-700 ring-blue-400/20",
  Delivered: "bg-emerald-100 text-emerald-700 ring-emerald-400/20",
  Cancelled: "bg-rose-100 text-rose-700 ring-rose-400/20",
};
const STATUS_DOT = {
  Pending:   "bg-orange-500",
  Shipped:   "bg-blue-500",
  Delivered: "bg-emerald-500",
  Cancelled: "bg-rose-500",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ${
        STATUS_STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-400/20"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || "bg-slate-400"}`} />
      {status}
    </span>
  );
}

function Admin() {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [product, setProduct] = useState({
    name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: 1,
  });

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchOrders();
  }, []);

  /* ── Fetch helpers ── */
  const fetchProducts = async () => {
    try { const res = await api.get("/api/products"); setProducts(res.data); }
    catch (err) { console.log(err); }
  };
  const fetchUsers = async () => {
    try { const res = await api.get("/api/auth/users"); setUsers(res.data); }
    catch (err) { console.log(err); }
  };
  const fetchOrders = async () => {
    try { const res = await api.get("/api/orders"); setOrders(res.data); }
    catch (err) { console.log(err); }
  };

  /* ── Product CRUD ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };
  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/products", {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
        categoryId: Number(product.categoryId),
      });
      alert("Product added successfully!");
      setProduct({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: 1 });
      fetchProducts();
    } catch (err) {
      alert("Failed to add product.");
    }
  };
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try { await api.delete(`/api/products/${id}`); fetchProducts(); }
    catch { alert("Delete failed."); }
  };
  const editProduct = (item) => {
    setEditingId(item.id);
    setProduct({ name: item.name, description: item.description, price: item.price, stock: item.stock, imageUrl: item.imageUrl, categoryId: item.categoryId });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveTab("products");
  };
  const updateProduct = async (id) => {
    try {
      await api.put(`/api/products/${id}`, {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
        categoryId: Number(product.categoryId),
      });
      alert("Product updated!");
      setEditingId(null);
      setProduct({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: 1 });
      fetchProducts();
    } catch { alert("Update failed."); }
  };
  const cancelEdit = () => {
    setEditingId(null);
    setProduct({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: 1 });
  };

  /* ── Users ── */
  const changeRole = async (email, role) => {
    try { await api.put(`/api/auth/change-role/${email}?role=${role}`); fetchUsers(); }
    catch { console.log("Role update failed"); }
  };

  /* ── Orders ── */
  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch { alert("Failed to update order status."); }
  };

  /* ── Summary stats & Pagination ── */
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const productTotalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice((productPage - 1) * ITEMS_PER_PAGE, productPage * ITEMS_PER_PAGE);

  const orderTotalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const paginatedOrders = orders.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE);

  /* ── Tab config ── */
  const tabs = [
    { id: "products", label: "Products", icon: "📦" },
    { id: "orders",   label: "Orders",   icon: "🛒" },
    { id: "users",    label: "Customers", icon: "👥" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      {/* ── HEADER ── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Rachel's Store" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Rachel's Store — Manage products, orders & customers
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          System Live
        </span>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          {
            label: "Total Products",
            value: products.length,
            color: "from-blue-500 to-indigo-500",
            bg: "from-blue-50 to-indigo-50",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            ),
          },
          {
            label: "Total Orders",
            value: orders.length,
            color: "from-purple-500 to-fuchsia-500",
            bg: "from-purple-50 to-fuchsia-50",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            ),
          },
          {
            label: "Total Customers",
            value: users.length,
            color: "from-emerald-500 to-teal-500",
            bg: "from-emerald-50 to-teal-50",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            ),
          },
          {
            label: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`,
            color: "from-rose-500 to-orange-500",
            bg: "from-rose-50 to-orange-50",
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.bg} p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between`}
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
            </div>
            <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl text-white shadow-sm`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-8 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          TAB: PRODUCTS
      ══════════════════════════════════════ */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Add/Edit Form */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className={`p-2 rounded-lg ${editingId ? "bg-amber-100 text-amber-700" : "bg-gradient-to-br from-purple-600 to-rose-500 text-white"}`}>
                {editingId ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
            </div>

            <form
              onSubmit={editingId ? (e) => { e.preventDefault(); updateProduct(editingId); } : addProduct}
              className="space-y-4"
            >
              {[
                { label: "Product Title", name: "name", type: "text", placeholder: "e.g. Smart Watch Pro" },
                { label: "Price (₹)", name: "price", type: "number", placeholder: "e.g. 4999" },
                { label: "Stock Qty", name: "stock", type: "number", placeholder: "e.g. 50" },
                { label: "Category ID", name: "categoryId", type: "number", placeholder: "e.g. 1" },
                { label: "Image URL", name: "imageUrl", type: "text", placeholder: "https://..." },
              ].map((field) => (
                <div key={field.name} className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={product[field.name]}
                    onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition duration-200"
                    required={field.name !== "imageUrl"}
                  />
                </div>
              ))}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</label>
                <textarea
                  name="description"
                  placeholder="Product description..."
                  value={product.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition duration-200 resize-none"
                  required
                />
              </div>

              {product.imageUrl && (
                <div className="border border-slate-200 p-2 rounded-xl flex items-center gap-3 bg-slate-50">
                  <img src={product.imageUrl} alt="Preview" className="w-14 h-14 object-cover rounded-lg border bg-white" />
                  <span className="text-xs text-slate-500 truncate">Preview</span>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                {editingId ? (
                  <>
                    <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition text-sm">
                      Update Product
                    </button>
                    <button type="button" onClick={cancelEdit} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition text-sm">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-purple-200 hover:shadow-lg transition duration-200 text-sm">
                    Add Product
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Products Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Catalogue List</h2>
                <p className="text-xs text-slate-400 mt-0.5">{products.length} products total</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-4 px-5">Product</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Price</th>
                    <th className="py-4 px-4">Stock</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-slate-400">No products yet.</td>
                    </tr>
                  ) : (
                    paginatedProducts.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition duration-150">
                        <td className="py-3.5 px-5 flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-11 h-11 object-cover rounded-lg border border-slate-100 bg-white shrink-0"
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100"; }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate max-w-[160px]">{item.name}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[160px] mt-0.5">{item.description}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block bg-purple-50 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded">
                            ID:{item.categoryId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          ₹{item.price.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.stock > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10">
                              {item.stock} in stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-600/10">
                              Out of stock
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => editProduct(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                              </svg>
                            </button>
                            <button onClick={() => deleteProduct(item.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {products.length > ITEMS_PER_PAGE && (
              <div className="p-4 border-t border-slate-100">
                <Pagination
                  currentPage={productPage}
                  totalPages={productTotalPages}
                  onPageChange={setProductPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: ORDERS
      ══════════════════════════════════════ */}
      {activeTab === "orders" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Order Management</h2>
              <p className="text-xs text-slate-400 mt-0.5">{orders.length} orders total</p>
            </div>
            <div className="flex gap-2">
              {["Pending","Shipped","Delivered","Cancelled"].map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-4 px-5">Order ID</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-5 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">📭</span>
                        <p className="font-medium">No orders yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition duration-150">
                      <td className="py-4 px-5">
                        <span className="font-bold text-slate-800 font-mono">#{order.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-slate-800">{order.userName}</p>
                          <p className="text-xs text-slate-400">{order.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">
                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-xs">
                        {new Date(order.createdDate).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-4 px-5 text-right">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-xs font-semibold border border-slate-200 bg-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition cursor-pointer hover:border-purple-300"
                        >
                          {["Pending","Shipped","Delivered","Cancelled"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {orders.length > ITEMS_PER_PAGE && (
            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={orderPage}
                totalPages={orderTotalPages}
                onPageChange={setOrderPage}
              />
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: CUSTOMERS / USERS
      ══════════════════════════════════════ */}
      {activeTab === "users" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Registered Customers</h2>
            <p className="text-xs text-slate-400 mt-0.5">{users.length} registered accounts</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-4 px-5">Customer</th>
                  <th className="py-4 px-5">Email</th>
                  <th className="py-4 px-5 text-center">Role</th>
                  <th className="py-4 px-5 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition duration-150">
                    <td className="py-4 px-5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-rose-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400">UID: {user.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-600 font-medium">{user.email}</td>
                    <td className="py-4 px-5 text-center">
                      {user.role === "Admin" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 ring-1 ring-rose-600/15">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 ring-1 ring-slate-500/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />User
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      {user.role === "Admin" ? (
                        <button onClick={() => changeRole(user.email, "User")} className="text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-xl transition border border-orange-200/50">
                          Demote to User
                        </button>
                      ) : (
                        <button onClick={() => changeRole(user.email, "Admin")} className="text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-xl transition border border-blue-200/50">
                          Promote to Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;