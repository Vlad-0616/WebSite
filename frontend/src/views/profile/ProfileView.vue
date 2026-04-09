<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-white mb-8">Личный кабинет</h1>
    
    <div v-if="!authStore.user" class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
      <p class="text-gray-400">Загрузка данных...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Информация о пользователе -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div class="flex items-center gap-6 mb-8">
          <div class="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-3xl font-bold text-white">
            {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
          <div>
            <h2 class="text-2xl font-bold text-white">{{ authStore.user?.name }}</h2>
            <span 
              :class="[
                'inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold',
                authStore.isShipper ? 'bg-blue-500/20 text-blue-300' : 
                authStore.isCarrier ? 'bg-green-500/20 text-green-300' : 
                'bg-purple-500/20 text-purple-300'
              ]"
            >
              {{ getRoleText(authStore.user?.role) }}
            </span>
          </div>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <p class="text-gray-400 text-sm">Email</p>
              <p class="text-white font-semibold">{{ authStore.user?.email }}</p>
            </div>
          </div>
          
          <div v-if="authStore.user?.phone" class="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div>
              <p class="text-gray-400 text-sm">Телефон</p>
              <p class="text-white font-semibold">{{ authStore.user?.phone }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
            <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p class="text-gray-400 text-sm">Дата регистрации</p>
              <p class="text-white font-semibold">{{ formatDate(authStore.user?.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Быстрые действия -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h3 class="text-xl font-bold text-white mb-6">Быстрые действия</h3>
        
        <div class="space-y-3">
          <router-link 
            v-if="authStore.isShipper"
            to="/orders"
            class="block p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <p class="text-white font-semibold">Мои заказы</p>
            <p class="text-gray-400 text-sm">Просмотр и управление заказами</p>
          </router-link>
          
          <router-link 
            v-if="authStore.isCarrier"
            to="/profile/transporter/bids"
            class="block p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <p class="text-white font-semibold">Мои ставки</p>
            <p class="text-gray-400 text-sm">Просмотр сделанных ставок</p>
          </router-link>
          
          <router-link 
            v-if="authStore.isCarrier"
            to="/profile/transporter/trucks"
            class="block p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <p class="text-white font-semibold">Мой транспорт</p>
            <p class="text-gray-400 text-sm">Управление транспортными средствами</p>
          </router-link>
          
          <router-link 
            to="/favorites"
            class="block p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <p class="text-white font-semibold">Избранное</p>
            <p class="text-gray-400 text-sm">Сохранённые заказы и перевозчики</p>
          </router-link>
          
          <button 
            @click="handleLogout"
            class="w-full p-4 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-left"
          >
            <p class="text-red-300 font-semibold">Выйти из аккаунта</p>
            <p class="text-red-400/60 text-sm">Завершить текущую сессию</p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const loading = ref(true)

const getRoleText = (role) => {
  const roleMap = {
    shipper: 'Заказчик',
    carrier: 'Перевозчик',
    admin: 'Администратор'
  }
  return roleMap[role] || role
}

const formatDate = (date) => {
  if (!date) return 'Неизвестно'
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(async () => {
  // Если пользователь уже загружен в store, не перезапрашиваем
  if (!authStore.user) {
    await authStore.fetchUser()
  }
  loading.value = false
})
</script>
