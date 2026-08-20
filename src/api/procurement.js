import api from './axios'

export const procurementApi = {
    getVendors: () => 
        api.get('/procurement/vendors'),

    getVendorById: (vendorId) => 
        api.get(`/procurement/vendors/${vendorId}`),

    createVendor: (data) =>
        api.post('/procurement/vendors', data),

    updateVendor: (vendorId, data) =>
        api.put(`/procurement/vendors/${vendorId}`, data),

    deactivateVendor: (vendorId) =>
        api.delete(`/procurement/vendors/${vendorId}`),

    getOrders: () =>
        api.get('/procurement/orders'),

    getOrderById: (orderId) => 
        api.get(`/procurement/orders/${orderId}`),

    createOrder: (data) =>
        api.post('/procurement/orders', data),

    getOrdersByStatus: (status) =>
        api.get(`/procurement/orders/status/${status}`),

    submitOrder: (orderId) =>
        api.post(`/procurement/orders/${orderId}/submit`),

    approvedOrders: (orderId) =>
        api.get(`/procurement/orders/${orderId}/approve`),

    rejectOrder: (orderId) =>
        api.post(`/procurement/orders/${orderId}/reject`),

    receiveOrder: (orderId) =>
        api.post(`/procurement/orders/${orderId}/receive`),
}