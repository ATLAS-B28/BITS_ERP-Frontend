import api from './axios'

export const authApi = {
    login: (email, password) => 
        api.post('/auth/login', {email, password}),

    register: (name, email, password) =>
        api.post('/auth/register', {name, email, password}),

    refreshToken: (refreshToken) =>
        api.post('/auth/refresh', {refreshToken}),

    me: () => 
        api.get('/auth/me'),

    getPendingUsers: () => 
        api.get('/auth/admin/users/pending'),

    approveUser: (userId, data) => 
        api.post(`/auth/admin/users/${userId}/approve`, data),

    getAllUsers: () => 
        api.get('/auth/admin/users'),

    updateUser: (userId, data) =>
        api.patch(`/auth/admin/users/${userId}`, data),

    createUser: (email, password) =>
        api.post('/auth/admin/users', {email, password})
}