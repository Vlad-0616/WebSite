<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-20">
    <div class="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h1 class="text-3xl font-bold text-white text-center mb-8">Восстановление пароля</h1>
      
      <!-- Шаг 1: Ввод email -->
      <div v-if="step === 1">
        <p class="text-gray-300 mb-6 text-center">
          Введите ваш email, и мы отправим код для восстановления пароля
        </p>
        
        <form @submit.prevent="handleRequestRecover" class="space-y-6">
          <div>
            <label class="block text-gray-300 mb-2">Email</label>
            <input 
              v-model="email"
              type="email" 
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@mail.com"
            />
          </div>
          
          <div v-if="error" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {{ error }}
          </div>
          
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <span v-if="loading">Отправка...</span>
            <span v-else>Отправить код</span>
          </button>
        </form>
      </div>
      
      <!-- Шаг 2: Ввод кода -->
      <div v-else-if="step === 2">
        <p class="text-gray-300 mb-6 text-center">
          Введите код из письма
        </p>
        
        <form @submit.prevent="handleVerifyCode" class="space-y-6">
          <div>
            <label class="block text-gray-300 mb-2">Код подтверждения</label>
            <input 
              v-model="code"
              type="text" 
              required
              maxlength="6"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
              placeholder="123456"
            />
          </div>
          
          <div v-if="error" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {{ error }}
          </div>
          
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <span v-if="loading">Проверка...</span>
            <span v-else>Подтвердить</span>
          </button>
        </form>
      </div>
      
      <!-- Шаг 3: Новый пароль -->
      <div v-else-if="step === 3">
        <p class="text-gray-300 mb-6 text-center">
          Придумайте новый пароль
        </p>
        
        <form @submit.prevent="handleResetPassword" class="space-y-6">
          <div>
            <label class="block text-gray-300 mb-2">Новый пароль</label>
            <input 
              v-model="newPassword"
              type="password" 
              required
              minlength="6"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Минимум 6 символов"
            />
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2">Подтвердите пароль</label>
            <input 
              v-model="confirmPassword"
              type="password" 
              required
              minlength="6"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Повторите пароль"
            />
          </div>
          
          <div v-if="error" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {{ error }}
          </div>
          
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <span v-if="loading">Сохранение...</span>
            <span v-else>Сбросить пароль</span>
          </button>
        </form>
      </div>
      
      <div class="mt-6 text-center">
        <router-link to="/auth/login" class="text-blue-400 hover:text-blue-300 text-sm">
          Вернуться ко входу
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api/client'

const router = useRouter()

const step = ref(1)
const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const handleRequestRecover = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await apiClient.post('/api/auth/recover/request', { email: email.value })
    step.value = 2
  } catch (err) {
    error.value = err.response?.data?.message || 'Ошибка отправки кода'
  } finally {
    loading.value = false
  }
}

const handleVerifyCode = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await apiClient.post('/api/auth/recover/verify', { 
      email: email.value, 
      code: code.value 
    })
    step.value = 3
  } catch (err) {
    error.value = err.response?.data?.message || 'Неверный код'
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Пароли не совпадают'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    await apiClient.post('/api/auth/recover/reset', { 
      email: email.value, 
      code: code.value,
      new_password: newPassword.value 
    })
    
    router.push('/auth/login')
  } catch (err) {
    error.value = err.response?.data?.message || 'Ошибка сброса пароля'
  } finally {
    loading.value = false
  }
}
</script>
