import api from './axios'

export const salesApi = {
    getCustomers: () => 
        api.get('/sales/customers'),

    getCustomerById: (customerId) =>
        api.get(`/sales/customers/${customerId}`),

    createCustomer: (data) =>
        api.post('/sales/customers', data),

    getOrders: () =>
        api.get('/sales/orders'),

    getOrderById: (orderId) =>
        api.get(`/sales/orders/${orderId}`),

    createOrder: (data) =>
        api.post('/sales/orders', data),

    getOrdersByStatus: (status) =>
        api.get(`/sales/orders/status/${status}`),

    confirmOrder: (orderId) =>
        api.patch(`/sales/orders/${orderId}/confirm`),

    dispatchOrder: (orderId) =>
        api.patch(`/sales/orders/${orderId}/dispatch`),

    deliverOrder: (orderId) =>
        api.patch(`/sales/orders/${orderId}/deliver`),

    cancelOrder: (orderId) =>
        api.patch(`/sales/orders/${orderId}/cancel`),
}