import api from './api';

// Create order with payment
export const createOrderWithPayment = async (orderData) => {
    try {
        const response = await api.post('/api/orders/with-payment', orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating order with payment:', error);
        throw error.response?.data || { message: 'Failed to process order' };
    }
};

// Create a stripe payment intent
export const createPaymentIntent = async (intentData) => {
    try {
        const response = await api.post('/api/payments/create-intent', intentData);
        return response.data;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error.response?.data || { message: 'Failed to initialize payment' };
    }
};

// Create order without payment (for testing)
export const createOrder = async (orderData) => {
    try {
        const response = await api.post('/api/orders', orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error.response?.data || { message: 'Failed to create order' };
    }
};

// Get user orders
export const getUserOrders = async (page = 1, pageSize = 10) => {
    try {
        const response = await api.get(`/api/orders/user?page=${page}&pageSize=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error.response?.data || { message: 'Failed to fetch orders' };
    }
};

// Get order by ID
export const getOrderById = async (orderId) => {
    try {
        const response = await api.get(`/api/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error.response?.data || { message: 'Failed to fetch order' };
    }
};