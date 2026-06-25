import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripeCheckoutForm = ({ onSuccess, onError, isProcessing, setIsProcessing, beforeSubmit }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (beforeSubmit) {
            const isValid = beforeSubmit();
            if (!isValid) return;
        }

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setMessage('');

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message || 'Payment failed');
            onError(error.message || 'Payment failed');
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            setMessage('Payment successful!');
            onSuccess(paymentIntent.id);
        } else {
            const msg = 'Unexpected payment state. Please try again.';
            setMessage(msg);
            onError(msg);
            setIsProcessing(false);
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement id="payment-element" />
            {message && (
                <div className={`text-sm px-3 py-2 rounded-lg ${message.includes('successful') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                </div>
            )}
            <button
                type="submit"
                disabled={isProcessing || !stripe || !elements}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
                {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                    </span>
                ) : 'Pay & Place Order'}
            </button>
        </form>
    );
};

export default StripeCheckoutForm;
