import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('accessToken') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!accessToken.value)
  
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isShipper = computed(() => user.value?.role === 'shipper')
  const isCarrier = computed(() => user.value?.role === 'carrier')

  async function login(credentials) {
    try {
      const response = await apiClient.post('/api/auth/login', credentials)
      const { user: userData, access_token, refresh_token } = response.data
      
      user.value = userData
      accessToken.value = access_token
      refreshToken.value = refresh_token
      
      localStorage.setItem('accessToken', access_token)
      localStorage.setItem('refreshToken', refresh_token)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Ошибка входа' 
      }
    }
  }

  async function register(data) {
    try {
      const response = await apiClient.post('/api/auth/register', data)
      const { user: userData, access_token, refresh_token } = response.data
      
      user.value = userData
      accessToken.value = access_token
      refreshToken.value = refresh_token
      
      localStorage.setItem('accessToken', access_token)
      localStorage.setItem('refreshToken', refresh_token)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Ошибка регистрации' 
      }
    }
  }

  async function logout() {
    try {
      if (refreshToken.value) {
        await apiClient.post('/api/auth/logout', { refresh_token: refreshToken.value })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  async function fetchUser() {
    if (!accessToken.value) {
      console.warn('No access token, skipping fetchUser')
      return
    }
    
    // Если пользователь уже загружен, не перезапрашиваем
    if (user.value) {
      return
    }
    
    try {
      const response = await apiClient.get('/api/auth/me')
      user.value = response.data
    } catch (error) {
      console.error('Failed to fetch user:', error)
      if (error.response?.status === 401) {
        await logout()
      }
    }
  }

  async function refreshTokens() {
    if (!refreshToken.value) return false
    
    try {
      const response = await apiClient.post('/api/auth/refresh', { 
        refresh_token: refreshToken.value 
      })
      const { access_token } = response.data
      
      accessToken.value = access_token
      localStorage.setItem('accessToken', access_token)
      
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      await logout()
      return false
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isAdmin,
    isShipper,
    isCarrier,
    login,
    register,
    logout,
    fetchUser,
    refreshTokens
  }
})
