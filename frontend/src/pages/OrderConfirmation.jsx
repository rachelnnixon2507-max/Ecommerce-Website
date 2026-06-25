import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../api/paymentApi';

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await getOrderById(orderId);
                setOrder(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch order details');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
                <Link to="/my-orders" className="mt-4 inline-block text-blue-600 hover:underline">
                    View Your Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-green-600">Order Confirmed! 🎉</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Thank you for your order. We'll notify you when it ships.
                    </p>
                    {order?.userEmail && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            A confirmation email has been sent to <span className="font-medium text-gray-800 dark:text-gray-200">{order.userEmail}</span>.
                        </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                        Order #{order?.id}
                    </p>
                </div>

                {order && (
                    <div className="space-y-6">
                        <div className="border-t pt-6">
                            <h2 className="text-lg font-semibold mb-3">Order Details</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                    <span className="ml-2 font-medium">
                                        {order.status}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                                    <span className="ml-2 font-bold">₹{order.totalAmount?.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-600 dark:text-gray-400">Shipping Address:</span>
                                    <span className="ml-2">{order.shippingAddress}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-lg font-semibold mb-3">Items</h2>
                            <div className="space-y-2">
                                {order.orderItems?.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                                        <span>{item.productName} × {item.quantity}</span>
                                        <span>₹{item.totalPrice?.toLocaleString("en-IN")}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                id="view-orders-btn"
                                to="/my-orders"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-center"
                            >
                                View All Orders
                            </Link>
                            <Link
                                to="/products"
                                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-center"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderConfirmation;