import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../api/paymentApi';

const MyOrders = () => {
    const { isAuthenticated, user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalCount: 0,
    });

    useEffect(() => {
        if (!isAuthenticated()) {
            window.location.href = '/login';
            return;
        }
        fetchOrders(1);
    }, [isAuthenticated]);

    const fetchOrders = async (page) => {
        setLoading(true);
        setError('');
        try {
            const data = await getUserOrders(page, pagination.pageSize);
            setOrders(data.orders || []);
            setPagination({
                currentPage: data.currentPage || 1,
                totalPages: data.totalPages || 1,
                pageSize: data.pageSize || 10,
                totalCount: data.totalCount || 0,
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch orders');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchOrders(newPage);
        }
    };

    /**
     * Get status color for order status badge
     * @param {string} status - Order status
     * @returns {string} CSS classes for the badge
     */
    const getStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800 border border-yellow-300";
            
            case "Confirmed":
                return "bg-blue-100 text-blue-800 border border-blue-300";
            
            case "Processing":
                return "bg-purple-100 text-purple-800 border border-purple-300";
            
            case "Shipped":
                return "bg-indigo-100 text-indigo-800 border border-indigo-300";
            
            case "Delivered":
                return "bg-green-100 text-green-800 border border-green-300";
            
            case "Cancelled":
                return "bg-red-100 text-red-800 border border-red-300";
            
            case "PaymentFailed":
                return "bg-gray-100 text-gray-800 border border-gray-300";
            
            default:
                return "bg-gray-100 text-gray-800 border border-gray-300";
        }
    };

    /**
     * Get status icon for order status
     * @param {string} status - Order status
     * @returns {string} Icon name or emoji
     */
    const getStatusIcon = (status) => {
        switch (status) {
            case "Pending":
                return "⏳";
            case "Confirmed":
                return "✅";
            case "Processing":
                return "⚙️";
            case "Shipped":
                return "📦";
            case "Delivered":
                return "🚚";
            case "Cancelled":
                return "❌";
            case "PaymentFailed":
                return "💳";
            default:
                return "📋";
        }
    };

    /**
     * Format date to readable string
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!isAuthenticated()) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">My Orders</h1>
                <span className="text-sm text-gray-600 dark:text-gray-400 mt-2 md:mt-0">
                    {pagination.totalCount} order{pagination.totalCount !== 1 ? 's' : ''} total
                </span>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="text-6xl mb-4">🛒</div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No orders yet</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
                        Start shopping to see your orders here
                    </p>
                    <Link 
                        to="/products" 
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div 
                                key={order.id} 
                                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
                            >
                                {/* Order Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50 dark:bg-gray-900/50 border-b">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Order #
                                        </span>
                                        <span className="font-mono font-semibold text-lg">
                                            {order.id}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)} {order.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 md:mt-0">
                                        {formatDate(order.orderDate)}
                                    </div>
                                </div>

                                {/* Order Body */}
                                <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Items */}
                                        <div className="md:col-span-2">
                                            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                                Items
                                            </h4>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {order.orderItems?.map((item) => (
                                                    <div 
                                                        key={item.id} 
                                                        className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-700 pb-1"
                                                    >
                                                        <span className="flex-1">
                                                            {item.productName} 
                                                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                                                                × {item.quantity}
                                                            </span>
                                                        </span>
                                                        <span className="font-medium ml-4">
                                                            ₹{item.totalPrice?.toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Order Summary */}
                                        <div className="border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Total</span>
                                                    <span className="font-bold text-lg">
                                                        ₹{order.totalAmount?.toLocaleString("en-IN")}
                                                    </span>
                                                </div>
                                                {order.trackingNumber && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">Tracking</span>
                                                        <span className="font-mono text-xs">
                                                            {order.trackingNumber}
                                                        </span>
                                                    </div>
                                                )}
                                                <Link
                                                    to={`/order/${order.id}`}
                                                    className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm mt-2"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    {order.shippingAddress && (
                                        <div className="mt-4 pt-4 border-t text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Shipping to: </span>
                                            <span className="font-medium">{order.shippingAddress}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} -{' '}
                                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of{' '}
                                {pagination.totalCount} orders
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 flex items-center">
                                    {pagination.currentPage} / {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MyOrders;