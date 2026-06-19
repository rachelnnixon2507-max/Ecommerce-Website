import React from "react";
import api from "../api/api";

export default function OrderActions({ orderId, status, onRefresh }) {
  const cancelOrder = async () => {
    try {
      await api.put(`/api/orders/${orderId}/cancel`);
      alert("Order cancelled");
      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel order");
    }
  };

  const requestReturn = async () => {
    try {
      await api.put(`/api/orders/${orderId}/return`);
      alert("Return requested");
      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert("Failed to request return");
    }
  };

  const requestReplacement = async () => {
    try {
      await api.put(`/api/orders/${orderId}/replacement`);
      alert("Replacement requested");
      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert("Failed to request replacement");
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      {status === "Pending" && (
        <button
          onClick={cancelOrder}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Cancel
        </button>
      )}

      {status === "Delivered" && (
        <>
          <button
            onClick={requestReturn}
            className="bg-yellow-500 text-white px-3 py-1 rounded"
          >
            Return
          </button>

          <button
            onClick={requestReplacement}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Replacement
          </button>
        </>
      )}
    </div>
  );
}