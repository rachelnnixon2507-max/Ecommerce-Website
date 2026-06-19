import { useEffect, useState } from "react";
import api from "../api/api";
import OrderActions from "./OrderActions";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const userString = localStorage.getItem("user");

      console.log("Raw User:", userString);

      if (!userString) {
        console.error("No user found in localStorage");
        return;
      }

      const user = JSON.parse(userString);

      console.log("User:", user);
      console.log("User ID:", user?.id);

      const response = await api.get(
        `/api/orders/user/${user.id}`,
        {
          withCredentials: true,
        }
      );

      console.log("Orders Response:", response.data);

      setOrders(response.data);
    } catch (error) {
      console.error("Orders Error:", error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text-xl">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">
          No orders found.
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow p-5 mb-5"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-lg">
                  Order #{order.id}
                </h2>

                <p className="text-gray-500">
                  {new Date(order.createdDate).toLocaleString()}
                </p>
              </div>
                 <OrderActions
                  orderId={order.id}
                  status={order.status}
                  onRefresh={fetchOrders}
                />
              <span
                className={`px-3 py-1 rounded text-white ${
                  order.status === "Delivered"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="border-t pt-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between py-2"
                >
                  <div>
                    {item.productName} (x{item.quantity})
                  </div>

                  <div>
                    ₹{item.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 text-right font-bold text-lg">
              Total: ₹{order.totalAmount.toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;