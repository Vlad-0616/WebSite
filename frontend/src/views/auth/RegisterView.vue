<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-20">
    <div class="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h1 class="text-3xl font-bold text-white text-center mb-8">Регистрация</h1>
      
      <!-- Выбор роли -->
      <div class="mb-6">
        <label class="block text-gray-300 mb-3">Выберите роль</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="form.role = 'shipper'"
            :class="[
              'px-4 py-3 rounded-lg font-semibold transition-colors border',
              form.role === 'shipper'
                ? 'bg-blue-500 border-blue-400 text-white'
                : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
            ]"
          >
            Заказчик
          </button>
          <button
            type="button"
            @click="form.role = 'carrier'"
            :class="[
              'px-4 py-3 rounded-lg font-semibold transition-colors border',
              form.role === 'carrier'
                ? 'bg-blue-500 border-blue-400 text-white'
                : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
            ]"
          >
            Перевозчик
          </button>
        </div>
      </div>
      
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-gray-300 mb-2">Имя</label>
          <input 
            v-model="form.name"
            type="text" 
            required
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Иван Иванов"
          />
        </div>
        
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
          <label class="block text-gray-300 mb-2">Телефон</label>
          <input 
            v-model="form.phone"
            type="tel" 
            required
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+375 (29) 123-45-67"
          />
        </div>
        
        <div>
          <label class="block text-gray-300 mb-2">Пароль</label>
          <input 
            v-model="form.password"
            type="password" 
            required
            minlength="6"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Минимум 6 символов"
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
          <span v-if="loading">Регистрация...</span>
          <span v-else>Зарегистрироваться</span>
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-gray-300 text-sm">
          Уже есть аккаунт? 
          <router-link to="/auth/login" class="text-blue-400 hover:text-blue-300">
            Войти
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  email: '',
  phone: '',
  password: '',
  role: 'shipper',
  name: ''
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  
  const result = await authStore.register(form.value)
  
  loading.value = false
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }
}
</script>
