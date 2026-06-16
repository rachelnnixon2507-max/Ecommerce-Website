import { useEffect, useState } from "react";
import api from "../api/api";

function Admin() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    categoryId: 1,
  });

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products");
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/auth/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      alert("Product Added Successfully");
      setProduct({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
        categoryId: 1,
      });
      fetchProducts();
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Failed To Add Product");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/api/products/${id}`);
      alert("Deleted Successfully");
      fetchProducts();
    } catch (error) {
      console.log(error);
      alert("Delete Failed");
    }
  };

  const changeRole = async (email, role) => {
    try {
      await api.put(`/api/auth/change-role/${email}?role=${role}`);
      fetchUsers();
      alert("Role Updated");
    } catch (error) {
      console.log(error);
    }
  };

  const editProduct = (item) => {
    setEditingId(item.id);
    setProduct({
      name: item.name,
      description: item.description,
      price: item.price,
      stock: item.stock,
      imageUrl: item.imageUrl,
      categoryId: item.categoryId,
    });
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const updateProduct = async (id) => {
    try {
      await api.put(`/api/products/${id}`, {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
        categoryId: Number(product.categoryId),
      });

      alert("Product Updated Successfully");
      setEditingId(null);
      setProduct({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
        categoryId: 1,
      });
      fetchProducts();
    } catch (error) {
      console.log(error);
      alert("Update Failed");
    }
  };
  const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "bg-orange-100 text-orange-600";

    case "Shipped":
      return "bg-blue-100 text-blue-600";

    case "Delivered":
      return "bg-green-100 text-green-600";

    case "Cancelled":
      return "bg-red-100 text-red-600";

    default:
      return "";
  }
};
  const cancelEdit = () => {
    setEditingId(null);
    setProduct({
      name: "",
      description: "",
      price: "",
      stock: "",
      imageUrl: "",
      categoryId: 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Control Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your store catalogue, inventory levels, and system user roles.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Live
          </span>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* STAT 1: Total Products */}
        <div className="bg-gradient-to-br from-white to-blue-50/20 p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
            <p className="text-3xl font-extrabold text-slate-900">{products.length}</p>
          </div>
          <div className="p-3 bg-blue-100/60 rounded-xl text-blue-600">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
        </div>

        {/* STAT 2: In Stock */}
        <div className="bg-gradient-to-br from-white to-emerald-50/20 p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Stock Items</span>
            <p className="text-3xl font-extrabold text-slate-900">
              {products.filter((p) => p.stock > 0).length}
            </p>
          </div>
          <div className="p-3 bg-emerald-100/60 rounded-xl text-emerald-600">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* STAT 3: Out of Stock */}
        <div className="bg-gradient-to-br from-white to-rose-50/20 p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Out of Stock</span>
            <p className="text-3xl font-extrabold text-slate-900">
              {products.filter((p) => p.stock === 0).length}
            </p>
          </div>
          <div className="p-3 bg-rose-100/60 rounded-xl text-rose-600">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
        </div>

      </div>

      {/* TWO COLUMN GRID FOR PRODUCT CREATION & TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
        
        {/* ADD/EDIT FORM SECTION */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className={`p-2 rounded-lg ${editingId ? "bg-amber-100 text-amber-700" : "bg-slate-900 text-white"}`}>
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
              {editingId ? "Edit Product Info" : "Add New Product"}
            </h2>
          </div>

          <form onSubmit={editingId ? (e) => { e.preventDefault(); updateProduct(editingId); } : addProduct} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Product Title</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Smart Watch Active"
                value={product.name}
                onChange={handleChange}
                className="w-full border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</label>
              <textarea
                name="description"
                placeholder="Product characteristics..."
                value={product.description}
                onChange={handleChange}
                rows="3"
                className="w-full border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={product.price}
                  onChange={handleChange}
                  className="w-full border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  placeholder="Qty"
                  value={product.stock}
                  onChange={handleChange}
                  className="w-full border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category ID</label>
              <input
                type="number"
                name="categoryId"
                placeholder="e.g. 1"
                value={product.categoryId}
                onChange={handleChange}
                className="w-full border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Image URL</label>
              <input
                type="text"
                name="imageUrl"
                placeholder="https://..."
                value={product.imageUrl}
                onChange={handleChange}
                className="w-full border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
              />
            </div>

            {product.imageUrl && (
              <div className="mt-3 border border-slate-200 p-2 rounded-xl flex items-center gap-3 bg-slate-50">
                <img
                  src={product.imageUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg border bg-white"
                />
                <span className="text-xs text-slate-500 truncate">Image Preview</span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              {editingId ? (
                <>
                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition duration-200 text-sm flex items-center justify-center gap-2"
                  >
                    Update Changes
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition duration-200 text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow transition duration-200 text-sm flex items-center justify-center gap-2"
                >
                  Create Product
                </button>
              )}
            </div>

          </form>
        </div>

        {/* LIST OF PRODUCTS SECTION */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Catalogue List
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update stock levels, modify details or remove entries.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-4 px-6">Product details</th>
                  <th className="py-4 px-4 text-center">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400">
                      No products available in database.
                    </td>
                  </tr>
                ) : (
                  products.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition duration-150">
                      
                      {/* Name & Image */}
                      <td className="py-3.5 px-6 flex items-center gap-4.5">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-100 bg-white"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100";
                          }}
                        />
                        <div className="max-w-[150px] sm:max-w-[200px] truncate">
                          <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{item.description}</p>
                        </div>
                      </td>

                      {/* Category ID */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded">
                          ID: {item.categoryId}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        ₹{item.price.toLocaleString("en-IN")}
                      </td>

                      {/* Stock Status */}
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

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => editProduct(item)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Product"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteProduct(item.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Product"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
        </div>

      </div>

      {/* USERS MANAGEMENT */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-10">
        
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">
            Registered Users Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure authorization credentials and promote members to system administrators.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-4 px-6">User profile</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6 text-center">Security Role</th>
                <th className="py-4 px-6 text-right">Modify Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition duration-150">
                  
                  {/* User Profile */}
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-400">UID: {user.id}</p>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-4 px-6 text-slate-600 font-medium">
                    {user.email}
                  </td>

                  {/* Security Role Badge */}
                  <td className="py-4 px-6 text-center">
                    {user.role === "Admin" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 ring-1 ring-red-600/15">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 ring-1 ring-slate-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        User
                      </span>
                    )}
                  </td>

                  {/* Modify Access Action */}
                  <td className="py-4 px-6 text-right">
                    {user.role === "Admin" ? (
                      <button
                        onClick={() => changeRole(user.email, "User")}
                        className="text-xs font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-xl transition duration-200 border border-orange-200/50"
                      >
                        Demote to User
                      </button>
                    ) : (
                      <button
                        onClick={() => changeRole(user.email, "Admin")}
                        className="text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-xl transition duration-200 border border-blue-200/50"
                      >
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

    </div>
  );
}

export default Admin;