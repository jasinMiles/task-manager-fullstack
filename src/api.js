import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, ''),
  headers: { 'Content-Type': 'application/json' }
})
api.interceptors.request.use(config => {
  const token = localStorage.getItem('taskflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
export const messageFrom = error =>
  error?.response?.data?.message || error?.response?.data?.errors?.[0]?.msg ||
  error?.message || 'Something went wrong. Please try again.'
export default api