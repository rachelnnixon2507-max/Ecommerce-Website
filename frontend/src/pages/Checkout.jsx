import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrderWithPayment, createPaymentIntent } from '../api/paymentApi';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCheckoutForm from '../components/StripeCheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, getCartTotal, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({ shippingAddress: '', notes: '' });
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [paymentToken, setPaymentToken] = useState('');
    const [clientSecret, setClientSecret] = useState('');

    // PayPal modal state
    const [showPaypalModal, setShowPaypalModal] = useState(false);
    const [paypalEmail, setPaypalEmail] = useState('');
    const [paypalPassword, setPaypalPassword] = useState('');
    const [paypalProcessing, setPaypalProcessing] = useState(false);
    const [paypalAuthorized, setPaypalAuthorized] = useState(false);

    // GPay mock state
    const [gpayProcessing, setGpayProcessing] = useState(false);
    const [gpayAuthorized, setGpayAuthorized] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) { navigate('/login'); return; }
        if (!cart || cart.length === 0) { navigate('/cart'); return; }
    }, []);

    // Fetch Stripe payment intent when card is selected
    useEffect(() => {
        if (paymentMethod !== 'card' || !cart || cart.length === 0 || clientSecret) return;
        const fetchIntent = async () => {
            try {
                const orderItems = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
                const res = await createPaymentIntent({ orderItems });
                setClientSecret(res.clientSecret || res.ClientSecret);
            } catch (err) {
                console.error('Error fetching payment intent:', err);
                setError('Could not initialize card payment. Please try another method.');
            }
        };
        fetchIntent();
    }, [paymentMethod, cart]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateShipping = () => {
        if (!formData.shippingAddress.trim()) {
            setError('Please enter a shipping address');
            return false;
        }
        setError('');
        return true;
    };

    // ── COD submission ──
    const handleCOD = async () => {
        if (!validateShipping()) return;
        setLoading(true);
        setError('');
        try {
            const orderData = {
                shippingAddress: formData.shippingAddress,
                notes: formData.notes,
                paymentMethod: 'cod',
                orderItems: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
            };
            const result = await createOrderWithPayment(orderData);
            clearCart();
            setSuccess(true);
            setTimeout(() => navigate(`/order/${result.orderId}`, { replace: true }), 1500);
        } catch (err) {
            setError(err.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── PayPal ──
    const handlePaypalAuth = (e) => {
        e.preventDefault();
        if (!paypalEmail || !paypalPassword) { setError('Please enter PayPal credentials.'); return; }
        setPaypalProcessing(true);
        setTimeout(() => {
            setPaypalProcessing(false);
            setPaypalAuthorized(true);
            setPaymentToken('mock_paypal_token_' + Date.now());
            setShowPaypalModal(false);
            setError('');
        }, 1500);
    };

    const handlePaypalSubmit = async (e) => {
        e.preventDefault();
        if (!validateShipping()) return;
        if (!paypalAuthorized) { setError('Please authorize your PayPal account first.'); return; }
        setLoading(true);
        setError('');
        try {
            const result = await createOrderWithPayment({
                shippingAddress: formData.shippingAddress,
                notes: formData.notes,
                paymentToken: paymentToken,
                paymentMethod: 'paypal',
                orderItems: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
            });
            clearCart();
            setSuccess(true);
            setTimeout(() => navigate(`/order/${result.orderId}`, { replace: true }), 1500);
        } catch (err) {
            setError(err.message || 'Failed to process PayPal payment.');
        } finally {
            setLoading(false);
        }
    };

    // ── Google Pay (simulated) ──
    const handleGPay = () => {
        if (!validateShipping()) return;
        setGpayProcessing(true);
        setTimeout(async () => {
            setGpayProcessing(false);
            setGpayAuthorized(true);
            setLoading(true);
            setError('');
            try {
                const result = await createOrderWithPayment({
                    shippingAddress: formData.shippingAddress,
                    notes: formData.notes,
                    paymentToken: 'mock_gpay_token_' + Date.now(),
                    paymentMethod: 'gpay',
                    orderItems: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
                });
                clearCart();
                setSuccess(true);
                setTimeout(() => navigate(`/order/${result.orderId}`, { replace: true }), 1500);
            } catch (err) {
                setError(err.message || 'Failed to process Google Pay payment.');
            } finally {
                setLoading(false);
            }
        }, 2000);
    };

    // ── Stripe card ──
    const handleStripeSuccess = async (intentId) => {
        if (!validateShipping()) return;
        setLoading(true);
        setError('');
        try {
            const result = await createOrderWithPayment({
                shippingAddress: formData.shippingAddress,
                notes: formData.notes,
                paymentToken: intentId,
                paymentMethod: 'card',
                orderItems: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
            });
            clearCart();
            setSuccess(true);
            setTimeout(() => navigate(`/order/${result.orderId}`, { replace: true }), 1500);
        } catch (err) {
            setError(err.message || 'Failed to process card payment.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 text-center max-w-md">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully!</h2>
                    <p className="text-gray-600 dark:text-gray-400">Redirecting to your order details...</p>
                </div>
            </div>
        );
    }

    const paymentMethods = [
        { id: 'card',   label: '💳 Credit/Debit Card',   sublabel: 'Secure Stripe payment' },
        { id: 'gpay',   label: '🟢 Google Pay',          sublabel: 'Pay via UPI / GPay' },
        { id: 'paypal', label: '🌐 PayPal',              sublabel: 'Pay with PayPal' },
        { id: 'cod',    label: '💵 Cash on Delivery',    sublabel: 'Pay when delivered' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Shipping + Payment */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">📦 Shipping Information</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Shipping Address *
                                </label>
                                <textarea
                                    name="shippingAddress"
                                    value={formData.shippingAddress}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                                    rows="3"
                                    placeholder="Full address including city, state, PIN code"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Order Notes (Optional)
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                                    rows="2"
                                    placeholder="Any special instructions?"
                                />
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">💳 Payment Method</h2>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {paymentMethods.map(pm => (
                                    <button
                                        key={pm.id}
                                        type="button"
                                        onClick={() => { setPaymentMethod(pm.id); setError(''); setGpayAuthorized(false); setPaypalAuthorized(false); }}
                                        className={`p-4 rounded-xl border-2 text-left transition ${
                                            paymentMethod === pm.id
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{pm.label}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{pm.sublabel}</div>
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* CARD: Stripe */}
                            {paymentMethod === 'card' && (
                                clientSecret ? (
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <StripeCheckoutForm
                                            onSuccess={handleStripeSuccess}
                                            onError={(msg) => setError(msg)}
                                            isProcessing={loading}
                                            setIsProcessing={setLoading}
                                            beforeSubmit={validateShipping}
                                        />
                                    </Elements>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                                        <p>Initializing secure payment...</p>
                                    </div>
                                )
                            )}

                            {/* GOOGLE PAY */}
                            {paymentMethod === 'gpay' && (
                                <div className="text-center space-y-4 py-4">
                                    <div className="text-5xl">🟢</div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Google Pay / UPI</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Pay instantly using your Google Pay or UPI account.
                                    </p>
                                    {gpayAuthorized ? (
                                        <div className="inline-block bg-green-100 text-green-700 py-2 px-6 rounded-lg font-medium">
                                            ✓ Payment Processed
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleGPay}
                                            disabled={gpayProcessing || loading}
                                            className="w-full bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-900 font-bold py-3 px-6 rounded-xl shadow transition flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {gpayProcessing ? (
                                                <>
                                                    <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                                                    Processing Google Pay...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-2xl">G</span> Pay with Google Pay
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* PAYPAL */}
                            {paymentMethod === 'paypal' && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 text-center">
                                        <div className="text-4xl mb-3">🌐</div>
                                        <h3 className="font-semibold text-blue-900 dark:text-blue-300">PayPal Checkout</h3>
                                        {paypalAuthorized ? (
                                            <div className="mt-3 bg-green-100 text-green-700 py-2 px-4 rounded-lg text-sm font-medium inline-block">
                                                ✓ PayPal Connected ({paypalEmail})
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setShowPaypalModal(true)}
                                                className="mt-3 bg-amber-400 hover:bg-amber-500 text-blue-900 font-bold py-2.5 px-6 rounded-full shadow transition"
                                            >
                                                Pay with <span className="italic font-extrabold text-blue-800">PayPal</span>
                                            </button>
                                        )}
                                    </div>
                                    {paypalAuthorized && (
                                        <button
                                            type="button"
                                            onClick={handlePaypalSubmit}
                                            disabled={loading}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : 'Place Order with PayPal'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* COD */}
                            {paymentMethod === 'cod' && (
                                <div className="space-y-4">
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
                                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">💵 Cash on Delivery</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Pay in cash when your order is delivered. Please keep the exact amount ready for the delivery agent.
                                        </p>
                                        <ul className="text-sm text-gray-600 dark:text-gray-400 mt-3 space-y-1">
                                            <li>✓ No online payment required</li>
                                            <li>✓ Pay securely at your door</li>
                                            <li>✓ Order confirmed instantly</li>
                                        </ul>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCOD}
                                        disabled={loading}
                                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                                    >
                                        {loading ? 'Placing Order...' : `Place COD Order — ₹${getCartTotal().toLocaleString('en-IN')}`}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Order Summary</h2>
                            <div className="space-y-3 max-h-72 overflow-y-auto mb-4 pr-1">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-3 border-b dark:border-gray-700 pb-3">
                                        <img
                                            src={item.imageUrl || item.image || '/placeholder.png'}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                                        </div>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t dark:border-gray-700 pt-4 space-y-2">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900 dark:text-white">₹{getCartTotal().toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold pt-3 border-t dark:border-gray-700 text-gray-900 dark:text-white">
                                    <span>Total</span>
                                    <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PayPal Modal */}
            {showPaypalModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-gray-700">
                        <div className="bg-[#003087] p-5 flex justify-between items-center text-white">
                            <span className="text-xl font-bold italic">PayPal Secure Checkout</span>
                            <button type="button" onClick={() => setShowPaypalModal(false)} className="text-white hover:text-gray-300 text-2xl font-bold">&times;</button>
                        </div>
                        <form onSubmit={handlePaypalAuth} className="p-6 space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                Authorize <span className="font-bold text-gray-900 dark:text-white">₹{getCartTotal().toLocaleString('en-IN')}</span>
                            </p>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                                <input type="email" value={paypalEmail} onChange={e => setPaypalEmail(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="your-paypal@email.com" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
                                <input type="password" value={paypalPassword} onChange={e => setPaypalPassword(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="••••••••" required />
                            </div>
                            <button type="submit" disabled={paypalProcessing}
                                className="w-full bg-[#0079C1] hover:bg-[#005EA6] text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50">
                                {paypalProcessing ? 'Authenticating...' : 'Log In & Authorize'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
