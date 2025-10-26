import axios from 'axios'

// Set up axios instance with JWT token if available
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor to add token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
      
      if (!refreshToken) {
        // No refresh token, log out user
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Try to refresh the token
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken
        })

        const newAccessToken = response.data.access
        
        // Store new token
        if (localStorage.getItem('token')) {
          localStorage.setItem('token', newAccessToken)
        } else {
          sessionStorage.setItem('token', newAccessToken)
        }

        // Update auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)
        isRefreshing = false

        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        isRefreshing = false
        
        // Refresh failed, log out user
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('refreshToken')
        window.location.href = '/login'
        
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
