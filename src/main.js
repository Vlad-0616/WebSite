import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(PrimeVue)

// загружаем пользователя после инициализации pinia и router
// используем setTimeout или nextTick чтобы дать время на инициализацию
import { useAuthStore } from './stores/auth'

// Ждём когда приложение будет готово
router.isReady().then(async () => {
  const authStore = useAuthStore()
  
  // Проверяем есть ли токен в localStorage
  const token = localStorage.getItem('accessToken')
  if (token) {
    // Устанавливаем токен в apiClient
    const apiClient = (await import('./api/client')).default
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    // Загружаем данные пользователя
    await authStore.fetchUser()
  }
  
  app.mount('#app')
})
