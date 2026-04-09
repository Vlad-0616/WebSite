<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-20">
    <div class="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h1 class="text-3xl font-bold text-white text-center mb-8">Вход</h1>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-gray-300 mb-2">Email</label>
          <input 
            v-model="form.email"
            type="email" 
            required
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="example@mail.com"
          />
        </div>
        
        <div>
          <label class="block text-gray-300 mb-2">Пароль</label>
          <input 
            v-model="form.password"
            type="password" 
            required
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите пароль"
          />
        </div>
        
        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input v-model="form.remember_me" type="checkbox" class="mr-2" />
            <span class="text-gray-300 text-sm">Запомнить меня</span>
          </label>
          <router-link to="/auth/recover" class="text-blue-400 hover:text-blue-300 text-sm">
            Забыли пароль?
          </router-link>
        </div>
        
        <div v-if="error" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {{ error }}
        </div>
        
        <button 
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          <span v-if="loading">Вход...</span>
          <span v-else>Войти</span>
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-gray-300 text-sm">
          Нет аккаунта? 
          <router-link to="/auth/register" class="text-blue-400 hover:text-blue-300">
            Создать аккаунт
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = ref({
  email: '',
  password: '',
  remember_me: false
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  const result = await authStore.login(form.value)
  
  loading.value = false
  
  if (result.success) {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } else {
    error.value = result.error
  }
}
</script>
