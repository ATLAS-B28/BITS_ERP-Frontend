import api from './axios'

export const inventoryApi = {
    getProducts: () => 
        api.get('/inventory/products'),

    getProductById: (productId) => 
        api.get(`/inventory/products/${productId}`),

    createProduct: (data) =>
        api.post('/inventory/products', data),

    updateStock: (productId, data) =>
        api.post(`/inventory/products/${productId}/stock`, data),

    getLowStockProducts: () =>
        api.get('/inventory/low-stock')
}