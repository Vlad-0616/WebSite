<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-20">
    <div class="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h1 class="text-3xl font-bold text-white text-center mb-8">Восстановление пароля</h1>
      
      <div v-if="step === 1">
        <p class="text-gray-300 mb-6 text-center text-sm">
          Введите ваш email, чтобы получить подсказку к кодовому слову.
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
          
          <div v-if="error" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>
          
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Поиск...' : 'Получить подсказку' }}
          </button>
        </form>
      </div>

      <div v-if="step === 2">
        <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p class="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-1">Ваша подсказка:</p>
          <p class="text-white font-medium text-lg">« {{ hintQuestion }} »</p>
        </div>
        
        <form @submit.prevent="handleVerifyCode" class="space-y-6">
          <div>
            <label class="block text-gray-300 mb-2">Кодовое слово</label>
            <input 
              v-model="code"
              type="text" 
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите ответ"
            />
          </div>
          
          <div v-if="error" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>
          
          <div class="flex gap-3">
            <button 
              type="button" 
              @click="step = 1" 
              class="w-1/3 bg-white/10 text-white px-4 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Назад
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="w-2/3 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {{ loading ? 'Проверка...' : 'Далее' }}
            </button>
          </div>
        </form>
      </div>

      <div v-if="step === 3">
        <p class="text-green-300 mb-6 text-center text-sm font-semibold">
          Кодовое слово подтверждено! Придумайте новый пароль.
        </p>
        
        <form @submit.prevent="handleResetPassword" class="space-y-6">
          <div>
            <label class="block text-gray-300 mb-2">Новый пароль</label>
            <input 
              v-model="newPassword"
              type="password" 
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Минимум 8 символов"
            />
          </div>

          <div>
            <label class="block text-gray-300 mb-2">Подтвердите новый пароль</label>
            <input 
              v-model="confirmPassword"
              type="password" 
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Повторите пароль"
            />
          </div>
          
          <div v-if="error" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>
          
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Сохранение...' : 'Сбросить пароль' }}
          </button>
        </form>
      </div>
      
      <div class="mt-6 text-center">
        <router-link to="/auth/login" class="text-blue-400 hover:text-blue-300 text-sm">
          Вернуться на страницу входа
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
const hintQuestion = ref('')
const code = ref('') // Здесь будет кодовое слово
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

// Шаг 1: Запрос подсказки
const handleRequestRecover = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiClient.post('/api/auth/recover/request', { email: email.value })
    hintQuestion.value = response.data.hint_question
    step.value = 2
  } catch (err) {
    error.value = err.response?.data?.message || 'Ошибка при запросе данных'
  } finally {
    loading.value = false
  }
}

// Шаг 2: Проверка кодового слова
const handleVerifyCode = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await apiClient.post('/api/auth/recover/verify', { 
      email: email.value, 
      secretWord: code.value 
    })
    step.value = 3
  } catch (err) {
    error.value = err.response?.data?.message || 'Неверное кодовое слово'
  } finally {
    loading.value = false
  }
}

// Шаг 3: Изменение пароля
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
      secretWord: code.value,
      password: newPassword.value,
      confirmPassword: confirmPassword.value
    })
    
    alert('Пароль успешно изменен! Теперь вы можете войти.')
    router.push('/auth/login')
  } catch (err) {
    error.value = err.response?.data?.message || 'Ошибка сброса пароля'
  } finally {
    loading.value = false
  }
}
</script>
