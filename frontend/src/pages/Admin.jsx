import { useEffect, useState } from "react";
import api from "../api/api";
import Pagination from "../components/Pagination";

const ITEMS_PER_PAGE = 10;

const STATUS_STYLES = {
  Pending:       "bg-orange-100 text-orange-700 ring-orange-400/20",
  Confirmed:     "bg-blue-100 text-blue-700 ring-blue-400/20",
  Processing:    "bg-purple-100 text-purple-700 ring-purple-400/20",
  Shipped:       "bg-indigo-100 text-indigo-700 ring-indigo-400/20",
  Delivered:     "bg-emerald-100 text-emerald-700 ring-emerald-400/20",
  Cancelled:     "bg-rose-100 text-rose-700 ring-rose-400/20",
  PaymentFailed: "bg-red-100 text-red-700 ring-red-400/20",
  Approved:      "bg-green-100 text-green-700 ring-green-400/20",
  Rejected:      "bg-red-100 text-red-700 ring-red-400/20",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-400/20"}`}>
      {status}
    </span>
  );
}

const getAllowedStatuses = (currentStatus) => {
  const transitions = {
    Pending:       ["Confirmed", "Cancelled"],
    Confirmed:     ["Processing", "Cancelled"],
    Processing:    ["Shipped", "Cancelled"],
    Shipped:       ["Delivered", "Cancelled"],
    Delivered:     [],
    Cancelled:     [],
    PaymentFailed: [],
  };
  return transitions[currentStatus] || [];
};

function Admin() {
  const [activeTab, setActiveTab] = useState("products");

  // Products
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [productPage, setProductPage] = useState(1);
  const [product, setProduct] = useState({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: 1 });

  // Categories
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", imageUrl: "" });

  // Users
  const [users, setUsers] = useState([]);

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [statusUpdateError, setStatusUpdateError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Returns/Replacements
  const [requests, setRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState("all");
  const [resolvingId, setResolvingId] = useState(null);
  const [resolveModal, setResolveModal] = useState(null); // { request, action }
  const [adminNote, setAdminNote] = useState("");
  const [resolveLoading, setResolveLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "products") { fetchProducts(); fetchCategories(); }
    if (activeTab === "categories") fetchCategories();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "requests") fetchRequests();
  }, [activeTab]);

  const fetchProducts  = async () => { try { const r = await api.get("/api/products"); setProducts(r.data); } catch(e) { console.error(e); } };
  const fetchCategories = async () => { try { const r = await api.get("/api/categories"); setCategories(r.data); } catch(e) { console.error(e); } };
  const fetchUsers     = async () => { try { const r = await api.get("/api/auth/users"); setUsers(r.data); } catch(e) { console.error(e); } };
  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const r = await api.get("/api/orders");
      setOrders(r.data.orders || []);
    } catch(e) {
      console.error("fetchOrders failed:", e);
      const msg = e.response?.data?.message || e.message || "Failed to load orders.";
      setOrdersError(msg);
    } finally {
      setOrdersLoading(false);
    }
  };
  const fetchRequests  = async () => {
    try {
      const params = requestFilter !== "all" ? `?status=${requestFilter}` : "";
      const r = await api.get(`/api/order-requests${params}`);
      setRequests(r.data || []);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { if (activeTab === "requests") fetchRequests(); }, [requestFilter]);

  // ── Product CRUD ──
  const handleChange = (e) => { const { name, value } = e.target; setProduct(p => ({ ...p, [name]: value })); };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/products", { ...product, price: Number(product.price), stock: Number(product.stock), categoryId: Number(product.categoryId) });
      alert("Product added!"); setProduct({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: 1 }); fetchProducts();
    } catch { alert("Failed to add product."); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try { await api.delete(`/api/products/${id}`); fetchProducts(); } catch { alert("Delete failed."); }
  };

  const editProduct = (item) => {
    setEditingId(item.id);
    setProduct({ name: item.name, description: item.description, price: item.price, stock: item.stock, imageUrl: item.imageUrl, categoryId: item.categoryId || 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveTab("products");
  };

  const updateProduct = async (id) => {
    try {
      await api.put(`/api/products/${id}`, { ...product, price: Number(product.price), stock: Number(product.stock), categoryId: Number(product.categoryId) });
      alert("Product updated!"); setEditingId(null); setProduct({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: 1 }); fetchProducts();
    } catch { alert("Update failed."); }
  };

  const cancelEdit = () => { setEditingId(null); setProduct({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: 1 }); };

  // ── Category CRUD ──
  const addCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/categories", newCategory);
      alert("Category added!"); setNewCategory({ name: "", imageUrl: "" }); fetchCategories();
    } catch { alert("Failed to add category."); }
  };

  // ── Users ──
  const changeRole = async (email, role) => {
    try { await api.put(`/api/auth/change-role/${email}?role=${role}`); fetchUsers(); } catch { console.log("Role update failed"); }
  };

  // ── Orders ──
  const submitStatusUpdate = async (orderId, newStatus, extraFields = {}) => {
    setStatusUpdating(true); setStatusUpdateError("");
    try {
      await api.put(`/api/orders/${orderId}/status`, { Status: newStatus, ...extraFields });
      const res = await api.get("/api/orders"); setOrders(res.data.orders || []); closeStatusModal();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update order status.";
      if (pendingStatusChange) setStatusUpdateError(msg); else alert(msg);
    } finally { setStatusUpdating(false); }
  };

  const updateOrderStatus = (orderId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    if (newStatus === "Shipped" || newStatus === "Cancelled") {
      setPendingStatusChange({ orderId, currentStatus, newStatus });
      setTrackingNumber(""); setCarrier(""); setCancellationReason(""); setStatusUpdateError("");
      return;
    }
    submitStatusUpdate(orderId, newStatus);
  };

  const closeStatusModal = () => { setPendingStatusChange(null); setStatusUpdateError(""); };

  const confirmPendingStatusChange = () => {
    if (!pendingStatusChange) return;
    const { orderId, newStatus } = pendingStatusChange;
    if (newStatus === "Shipped") {
      if (!trackingNumber.trim()) { setStatusUpdateError("Tracking number is required."); return; }
      submitStatusUpdate(orderId, newStatus, { trackingNumber: trackingNumber.trim(), carrier: carrier.trim() || undefined });
    } else if (newStatus === "Cancelled") {
      if (!cancellationReason.trim()) { setStatusUpdateError("Cancellation reason is required."); return; }
      submitStatusUpdate(orderId, newStatus, { cancellationReason: cancellationReason.trim() });
    }
  };

  // ── Return/Replacement Resolve ──
  const openResolveModal = (request, action) => { setResolveModal({ request, action }); setAdminNote(""); };

  const confirmResolve = async () => {
    if (!resolveModal) return;
    setResolveLoading(true);
    try {
      await api.put(`/api/order-requests/${resolveModal.request.id}/resolve`, {
        status: resolveModal.action, adminNote: adminNote || undefined
      });
      setResolveModal(null); fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resolve request.");
    } finally { setResolveLoading(false); }
  };

  // ── Stats ──
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const productTotalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice((productPage - 1) * ITEMS_PER_PAGE, productPage * ITEMS_PER_PAGE);
  const orderTotalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const paginatedOrders = orders.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE);

  const formatDate = (raw) => {
    if (!raw) return "—";
    const d = new Date(raw);
    return isNaN(d) ? "—" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const tabs = [
    { id: "products",   label: "Products",         icon: "📦" },
    { id: "categories", label: "Categories",        icon: "🗂️" },
    { id: "orders",     label: "Orders",            icon: "🛒" },
    { id: "users",      label: "Customers",         icon: "👥" },
    { id: "requests",   label: "Returns/Replacements", icon: "🔄" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Rachel's Store — Manage products, orders & customers</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> System Live
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Products",  value: products.length,  color: "from-blue-500 to-indigo-500",   bg: "from-blue-50 to-indigo-50",   icon: "📦" },
          { label: "Total Orders",    value: orders.length,    color: "from-purple-500 to-fuchsia-500", bg: "from-purple-50 to-fuchsia-50", icon: "🛒" },
          { label: "Total Customers", value: users.length,     color: "from-emerald-500 to-teal-500",  bg: "from-emerald-50 to-teal-50",  icon: "👥" },
          { label: "Total Revenue",   value: `₹${totalRevenue.toLocaleString("en-IN")}`, color: "from-rose-500 to-orange-500", bg: "from-rose-50 to-orange-50", icon: "💰" },
        ].map(stat => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.bg} p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between`}>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
            </div>
            <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl text-white text-2xl shadow-sm`}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-2xl mb-8 w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB: PRODUCTS ═══ */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Add/Edit Form */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{editingId ? "✏️ Edit Product" : "➕ Add Product"}</h2>
            <form onSubmit={editingId ? (e) => { e.preventDefault(); updateProduct(editingId); } : addProduct} className="space-y-4">
              {[
                { label: "Product Title", name: "name",        type: "text",   placeholder: "e.g. Smart Watch Pro" },
                { label: "Price (₹)",     name: "price",       type: "number", placeholder: "e.g. 4999" },
                { label: "Stock Qty",     name: "stock",       type: "number", placeholder: "e.g. 50" },
                { label: "Image URL",     name: "imageUrl",    type: "text",   placeholder: "https://..." },
              ].map(field => (
                <div key={field.name} className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{field.label}</label>
                  <input type={field.type} name={field.name} placeholder={field.placeholder} value={product[field.name]} onChange={handleChange}
                    className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition"
                    required={field.name !== "imageUrl"} />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
                <select name="categoryId" value={product.categoryId} onChange={handleChange}
                  className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</label>
                <textarea name="description" placeholder="Product description..." value={product.description} onChange={handleChange}
                  rows="3" className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition resize-none" required />
              </div>
              {product.imageUrl && (
                <div className="border border-slate-200 p-2 rounded-xl flex items-center gap-3 bg-slate-50">
                  <img src={product.imageUrl} alt="Preview" className="w-14 h-14 object-cover rounded-lg border bg-white" />
                  <span className="text-xs text-slate-500">Preview</span>
                </div>
              )}
              <div className="pt-2 flex flex-col gap-2">
                {editingId ? (
                  <>
                    <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition text-sm">Update Product</button>
                    <button type="button" onClick={cancelEdit} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition text-sm">Cancel</button>
                  </>
                ) : (
                  <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition text-sm">Add Product</button>
                )}
              </div>
            </form>
          </div>

          {/* Products Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
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
                    <tr><td colSpan="5" className="py-10 text-center text-slate-400">No products yet.</td></tr>
                  ) : paginatedProducts.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5 flex items-center gap-3">
                        <img src={item.imageUrl} alt={item.name} className="w-11 h-11 object-cover rounded-lg border border-slate-100 bg-white shrink-0"
                          onError={e => { e.target.src = "https://via.placeholder.com/50"; }} />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-[160px]">{item.name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[160px] mt-0.5">{item.description}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-purple-50 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded">
                          {categories.find(c => c.id === item.categoryId)?.name || `ID:${item.categoryId}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">₹{item.price?.toLocaleString("en-IN")}</td>
                      <td className="py-3.5 px-4">
                        {item.stock > 0
                          ? <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10">{item.stock} in stock</span>
                          : <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-600/10">Out of stock</span>}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => editProduct(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">✏️</button>
                          <button onClick={() => deleteProduct(item.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {products.length > ITEMS_PER_PAGE && (
              <div className="p-4 border-t border-slate-100">
                <Pagination currentPage={productPage} totalPages={productTotalPages} onPageChange={setProductPage} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ TAB: CATEGORIES ═══ */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">➕ Add Category</h2>
            <form onSubmit={addCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Category Name</label>
                <input type="text" value={newCategory.name} onChange={e => setNewCategory(p => ({...p, name: e.target.value}))}
                  className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition"
                  placeholder="e.g. Electronics" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Image URL</label>
                <input type="text" value={newCategory.imageUrl} onChange={e => setNewCategory(p => ({...p, imageUrl: e.target.value}))}
                  className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition"
                  placeholder="https://..." />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-rose-500 text-white font-bold py-3 rounded-xl shadow-md transition text-sm">
                Add Category
              </button>
            </form>
          </div>
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Categories ({categories.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-4 px-5">ID</th>
                    <th className="py-4 px-5">Category</th>
                    <th className="py-4 px-5">Products</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-5 text-slate-500 font-mono text-xs">#{cat.id}</td>
                      <td className="py-3.5 px-5 flex items-center gap-3">
                        {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 rounded-lg object-cover border bg-gray-100" />}
                        <span className="font-semibold text-slate-800">{cat.name}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
                          {products.filter(p => p.categoryId === cat.id).length} products
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: ORDERS ═══ */}
      {activeTab === "orders" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Order Management</h2>
              <p className="text-xs text-slate-400 mt-0.5">{orders.length} orders total</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            {ordersError && (
              <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                ⚠️ {ordersError}
              </div>
            )}
            {ordersLoading && (
              <div className="py-10 text-center text-slate-400 text-sm">Loading orders...</div>
            )}
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-4 px-5">Order</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Payment</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-5 text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedOrders.length === 0 ? (
                  <tr><td colSpan="7" className="py-16 text-center text-slate-400"><div className="flex flex-col items-center gap-2"><span className="text-3xl">📭</span><p className="font-medium">No orders yet</p></div></td></tr>
                ) : paginatedOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-5"><span className="font-bold text-slate-800 font-mono">#{order.id}</span></td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800">{order.userName}</p>
                      <p className="text-xs text-slate-400">{order.userEmail}</p>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">₹{Number(order.totalAmount).toLocaleString("en-IN")}</td>
                    <td className="py-4 px-4">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
                        {order.paymentMethod || "card"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-xs">{formatDate(order.orderDate || order.createdDate)}</td>
                    <td className="py-4 px-4 text-center"><StatusBadge status={order.status} /></td>
                    <td className="py-4 px-5 text-right">
                      {getAllowedStatuses(order.status).length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Final</span>
                      ) : (
                        <select defaultValue="" onChange={e => { if (e.target.value) updateOrderStatus(order.id, order.status, e.target.value); e.target.value = ""; }}
                          className="text-xs font-semibold border border-slate-200 bg-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition cursor-pointer">
                          <option value="" disabled>Move to...</option>
                          {getAllowedStatuses(order.status).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length > ITEMS_PER_PAGE && (
            <div className="p-4 border-t border-slate-100">
              <Pagination currentPage={orderPage} totalPages={orderTotalPages} onPageChange={setOrderPage} />
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: CUSTOMERS ═══ */}
      {activeTab === "users" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Registered Customers</h2>
            <p className="text-xs text-slate-400 mt-0.5">{users.length} accounts</p>
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
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-rose-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400">UID: {user.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-600">{user.email}</td>
                    <td className="py-4 px-5 text-center">
                      {user.role === "Admin"
                        ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 ring-1 ring-rose-600/15">Admin</span>
                        : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 ring-1 ring-slate-500/10">User</span>}
                    </td>
                    <td className="py-4 px-5 text-right">
                      {user.role === "Admin"
                        ? <button onClick={() => changeRole(user.email, "User")} className="text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-xl transition border border-orange-200/50">Demote to User</button>
                        : <button onClick={() => changeRole(user.email, "Admin")} className="text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-xl transition border border-blue-200/50">Promote to Admin</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ TAB: RETURNS & REPLACEMENTS ═══ */}
      {activeTab === "requests" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Return & Replacement Requests</h2>
              <p className="text-xs text-slate-400 mt-0.5">{requests.length} request(s)</p>
            </div>
            <div className="flex gap-2">
              {["all", "Pending", "Approved", "Rejected"].map(f => (
                <button key={f} onClick={() => setRequestFilter(f)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${requestFilter === f ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-600 border-slate-200 hover:border-purple-300"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-4 px-5">ID</th>
                  <th className="py-4 px-4">Order</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Reason</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {requests.length === 0 ? (
                  <tr><td colSpan="8" className="py-16 text-center text-slate-400"><div className="flex flex-col items-center gap-2"><span className="text-3xl">📋</span><p>No requests found</p></div></td></tr>
                ) : requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-5 font-mono text-xs text-slate-500">#{req.id}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-800">#{req.orderId}</span>
                      <p className="text-xs text-slate-400">₹{req.orderTotalAmount?.toLocaleString("en-IN")}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800">{req.userName}</p>
                      <p className="text-xs text-slate-400">{req.userEmail}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${req.requestType === "Return" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                        {req.requestType}
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-[180px]">
                      <p className="text-xs text-slate-600 truncate" title={req.reason}>{req.reason}</p>
                      {req.adminNote && <p className="text-xs text-slate-400 mt-1 italic">Note: {req.adminNote}</p>}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">{formatDate(req.createdDate)}</td>
                    <td className="py-4 px-4 text-center"><StatusBadge status={req.status} /></td>
                    <td className="py-4 px-5 text-right">
                      {req.status === "Pending" ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openResolveModal(req, "Approved")}
                            className="text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-xl border border-green-200/50 transition">
                            Approve
                          </button>
                          <button onClick={() => openResolveModal(req, "Rejected")}
                            className="text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 rounded-xl border border-red-200/50 transition">
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">{req.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Order Status Extra Info (Shipped/Cancelled) */}
      {pendingStatusChange && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">{pendingStatusChange.newStatus === "Shipped" ? "Mark as Shipped" : "Cancel Order"}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Order #{pendingStatusChange.orderId} → {pendingStatusChange.newStatus}</p>
            </div>
            <div className="p-5 space-y-4">
              {pendingStatusChange.newStatus === "Shipped" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tracking Number *</label>
                    <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                      placeholder="e.g. TRK123456789" autoFocus
                      className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Carrier (optional)</label>
                    <input type="text" value={carrier} onChange={e => setCarrier(e.target.value)}
                      placeholder="e.g. Delhivery, Blue Dart"
                      className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition" />
                  </div>
                </>
              )}
              {pendingStatusChange.newStatus === "Cancelled" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cancellation Reason *</label>
                  <textarea value={cancellationReason} onChange={e => setCancellationReason(e.target.value)}
                    placeholder="Reason for cancellation..." rows="3" autoFocus
                    className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition resize-none" />
                </div>
              )}
              {statusUpdateError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{statusUpdateError}</div>}
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-2 justify-end bg-slate-50/50">
              <button onClick={closeStatusModal} disabled={statusUpdating} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50">Cancel</button>
              <button onClick={confirmPendingStatusChange} disabled={statusUpdating}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 ${pendingStatusChange.newStatus === "Cancelled" ? "bg-rose-600 hover:bg-rose-700" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                {statusUpdating ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Resolve Return/Replacement */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className={`p-5 border-b ${resolveModal.action === "Approved" ? "bg-green-50" : "bg-red-50"}`}>
              <h3 className="text-lg font-bold text-slate-800">
                {resolveModal.action === "Approved" ? "✅ Approve" : "❌ Reject"} {resolveModal.request.requestType} Request
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Order #{resolveModal.request.orderId} — {resolveModal.request.userName}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600">
                <strong>Customer reason:</strong> {resolveModal.request.reason}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Admin Note (Optional)</label>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                  placeholder="Message to customer..." rows="3"
                  className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-2 justify-end bg-slate-50/50">
              <button onClick={() => setResolveModal(null)} disabled={resolveLoading} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50">Cancel</button>
              <button onClick={confirmResolve} disabled={resolveLoading}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 ${resolveModal.action === "Approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                {resolveLoading ? "Processing..." : resolveModal.action}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;
