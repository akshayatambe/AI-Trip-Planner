import axios from 'axios'

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
      }
      return Promise.reject(error)
    },
)

/** Kicks off the Google OAuth2 flow by navigating to the backend. */
export function startGoogleLogin() {
  window.location.href = `${BACKEND_URL}/oauth2/authorization/google`
}

export const AuthAPI = {
  me: () => api.get('/auth/me').then((r) => r.data),
  login: (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }).then((r) => r.data),
  updateProfile: (name) => api.put('/auth/me', { name }).then((r) => r.data),
}

export const TripAPI = {
  generate: (payload) => api.post('/trips/generate', payload).then((r) => r.data),
  list: () => api.get('/trips').then((r) => r.data),
  get: (id) => api.get(`/trips/${id}`).then((r) => r.data),
  remove: (id) => api.delete(`/trips/${id}`),
}

export default api