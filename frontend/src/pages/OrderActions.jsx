import React from "react";
import api from "../api/api";

export default function OrderActions({ orderId, status, onRefresh }) {
  
  // 1. Cancel Order (Stays the same as it likely still lives in OrdersController)
  const cancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.put(`/api/orders/${orderId}/cancel`);
      alert("Order cancelled");
      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel order");
    }
  };

  // 2. Request Return (UPDATED to use OrderRequestsController)
  const requestReturn = async () => {
    const reason = window.prompt("Please enter a reason for the return:");
    if (!reason) return;

    try {
      // Endpoint matches: [HttpPost("order/{orderId}")] in OrderRequestsController
      await api.post(`/api/order-requests/order/${orderId}`, {
        requestType: "Return",
        reason: reason
      });
      alert("Return request submitted successfully!");
      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit return request");
    }
  };

  // 3. Request Replacement (UPDATED to use OrderRequestsController)
  const requestReplacement = async () => {
    const reason = window.prompt("Please enter a reason for the replacement:");
    if (!reason) return;

    try {
      await api.post(`/api/order-requests/order/${orderId}`, {
        requestType: "Replacement",
        reason: reason
      });
      alert("Replacement request submitted successfully!");
      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit replacement request");
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      {/* Show Cancel button only if order is still Pending */}
      {status === "Pending" && (
        <button
          onClick={cancelOrder}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
        >
          Cancel Order
        </button>
      )}

      {/* Show Return/Replacement only if order is Delivered */}
      {status === "Delivered" && (
        <>
          <button
            onClick={requestReturn}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition"
          >
            Request Return
          </button>

          <button
            onClick={requestReplacement}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
          >
            Request Replacement
          </button>
        </>
      )}
    </div>
  );
}