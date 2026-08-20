import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000,
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if(token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if(error.response?.status == 401 && !originalRequest._retry) {
            originalRequest._retry = true

            const refreshToken = localStorage.getItem('refreshToken')
            if(!refreshToken) {
                clearAuthAndRedirect()
                return Promise.reject(error)
            }

            try {
                const response = await axios.post('/api/auth/refresh', {refreshToken})
                const {accessToken, refreshToken: newRefreshToken} = response.data.data

                localStorage.setItem('accessToken', accessToken)
                localStorage.setItem('refreshToken', newRefreshToken)

                originalRequest.headers.Authorization = `Bearer ${accessToken}`

                return api(originalRequest)
            } catch {
                clearAuthAndRedirect()
                return Promise.reject(error)
            }
        }

        return Promise.reject(error)
    }
)

function clearAuthAndRedirect() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    window.location.href = '/login'
}

export default api