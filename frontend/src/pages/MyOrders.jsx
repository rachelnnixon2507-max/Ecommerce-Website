import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import OrderActions from "./OrderActions";

const STATUS_COLORS = {
  Pending:       "bg-yellow-100 text-yellow-800",
  Confirmed:     "bg-blue-100 text-blue-800",
  Processing:    "bg-purple-100 text-purple-800",
  Shipped:       "bg-indigo-100 text-indigo-800",
  Delivered:     "bg-green-100 text-green-800",
  Cancelled:     "bg-red-100 text-red-800",
  PaymentFailed: "bg-red-100 text-red-800",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      // Fixed: use /api/orders/user (auth via cookie, not userId in URL)
      const response = await api.get("/api/orders/user", { withCredentials: true });
      // Response shape: { orders: [...], totalCount, currentPage, ... }
      const data = response.data;
      setOrders(data.orders || data || []);
    } catch (err) {
      console.error("Orders Error:", err);
      setError(err.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 && !error ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't placed any orders yet.</p>
            <Link to="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map(order => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover:shadow-lg transition">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                  <div>
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                      Order #{order.id}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.orderDate || order.createdDate)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}>
                      {order.status}
                    </span>
                    <Link to={`/order/${order.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium underline">
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Items - use orderItems (the correct field name from backend) */}
                <div className="border-t dark:border-gray-700 pt-4 space-y-2">
                  {(order.orderItems || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1">
                      <div className="flex items-center gap-2">
                        {item.productImage && (
                          <img src={item.productImage} alt={item.productName}
                            className="w-8 h-8 object-cover rounded bg-gray-100" />
                        )}
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.productName} <span className="text-gray-500">(×{item.quantity})</span>
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{(item.totalPrice || item.unitPrice * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t dark:border-gray-700 mt-4 pt-4 flex flex-wrap justify-between items-center gap-3">
                  <div className="text-right font-bold text-lg text-gray-900 dark:text-white">
                    Total: ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                  </div>
                  <OrderActions orderId={order.id} status={order.status} onRefresh={fetchOrders} />
                </div>

                {/* Tracking info */}
                {order.trackingNumber && (
                  <div className="mt-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg px-4 py-2 text-sm">
                    <span className="font-medium text-indigo-700 dark:text-indigo-300">Tracking: </span>
                    <span className="text-indigo-600 dark:text-indigo-400">{order.trackingNumber}</span>
                    {order.carrier && <span className="text-indigo-500"> via {order.carrier}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
