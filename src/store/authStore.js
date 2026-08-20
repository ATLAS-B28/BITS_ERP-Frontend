import useAuthStore from '../store/authStore.js';

export function useAuth() {
    const {user, isAuthenticated, setAuth, logout, isAdmin, hasRole, hasAnyRole} = useAuthStore();
    return {
        user, 
        isAuthenticated, 
        setAuth, 
        logout, 
        isAdmin: isAdmin(), 
        role: user?.role,
        hasRole, 
        hasAnyRole
    };
}