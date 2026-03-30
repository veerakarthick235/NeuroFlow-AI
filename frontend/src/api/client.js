import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8001',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  me: () => api.get('/me'),
}

// ─── Tasks ────────────────────────────────────────────────────────────────
export const tasksAPI = {
  list: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
}

// ─── AI ───────────────────────────────────────────────────────────────────
export const aiAPI = {
  generateTasks: (goal) => api.post('/generate-tasks', { goal }),
  getInsights: () => api.get('/insights'),
  getDailySummary: () => api.get('/daily-summary'),
}

export default api
