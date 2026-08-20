import {create} from 'zustand';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),

    setAuth: (data) => {
        const user = {
            email: data.email,
            role: data.role,
        }
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        set({
            user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
        })
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
        })
    },
    isAdmin: () => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        return user?.role === 'ADMIN';
    },
    hasRole: (role) => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        return user?.role === role;
    },
    hasAnyRole: (roles) => {
        const user = JSON.parse(localStorage.getItem('user') || 'null')
        return roles.includes(user?.role)
    }
}))

export default useAuthStore