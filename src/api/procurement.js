import api from './axios'

export const procurementApi = {
    getVendors: () => 
        api.get('/procurement/vendors'),

    getVendorById: (vendorId) => 
        api.get(`/procurement/vendors/${vendorId}`),

    // backward-compatible alias used across the codebase
    getVendor: (vendorId) =>
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

    // dispatched orders for map
    getDispatchedForMap: () =>
        api.get('/procurement/orders-dispatched-map'),

    getOrdersByStatus: (status) =>
        api.get(`/procurement/orders/status/${status}`),

    submitOrder: (orderId) =>
        api.patch(`/procurement/orders/${orderId}/submit`),

    approveOrder: (orderId) =>
        api.patch(`/procurement/orders/${orderId}/approve`),

    approvedOrders: (orderId) =>
        api.patch(`/procurement/orders/${orderId}/approve`),

    rejectOrder: (orderId) =>
        api.patch(`/procurement/orders/${orderId}/reject`),

    receiveOrder: (orderId) =>
        api.patch(`/procurement/orders/${orderId}/receive`),
}