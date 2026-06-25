import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        updateQuantity(productId, newQuantity);
    };

    const handleCheckout = () => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="max-w-4xl mx-auto p-6 text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12">
                        <div className="text-6xl mb-4">🛒</div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your Cart is Empty</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Looks like you haven't added any items to your cart yet.
                        </p>
                        <Link
                            to="/products"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
                        >
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT SIDE: Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <img
                                        src={item.imageUrl || item.image || '/placeholder.png'}
                                        alt={item.name}
                                        className="w-20 h-20 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            ₹{item.price.toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                            className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center text-gray-900 dark:text-white font-medium">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                            className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="text-right min-w-[80px]">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                        </p>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT SIDE: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
                            
                            <div className="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-4">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal ({cart.reduce((s,i)=>s+i.quantity,0)} items)</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        ₹{getCartTotal().toLocaleString("en-IN")}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-xl font-bold pt-4 text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span>₹{getCartTotal().toLocaleString("en-IN")}</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 mt-4"
                            >
                                Proceed to Checkout
                            </button>

                            <button
                                onClick={clearCart}
                                className="w-full text-red-500 hover:text-red-700 text-sm mt-3"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
