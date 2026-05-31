<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-white mb-8">Личный кабинет</h1>
    
    <!-- Вкладки навигации для заказчика -->
    <div v-if="authStore.isShipper" class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-8">
      <nav class="flex gap-4 flex-wrap">
        <router-link 
          to="/profile/my-orders"
          class="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/20"
        >
          Мои заказы
        </router-link>
        <router-link 
          to="/profile/settings"
          class="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/20"
        >
          Настройки
        </router-link>
      </nav>
    </div>

    <!-- Вкладки навигации для перевозчика -->
    <div v-if="authStore.isCarrier" class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-8">
      <nav class="flex gap-4 flex-wrap">
        <!-- МОИ СТАВКИ - ЗАКОММЕНТИРОВАНО -->
        <!-- <router-link 
          to="/profile/transporter/bids"
          class="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/20"
        >
          Мои ставки
        </router-link> -->
        <router-link 
          to="/profile/transporter/orders"
          class="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/20"
        >
          Мои заказы
        </router-link>
        <router-link 
          to="/profile/transporter/trucks"
          class="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/20"
        >
          Мой транспорт
        </router-link>
        <router-link 
          to="/profile/transporter/settings"
          class="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          active-class="bg-white/20"
        >
          Настройки
        </router-link>
      </nav>
    </div>

    <!-- ДВЕ КОЛОНКИ: информация о пользователе + контент (показывается ВСЕГДА) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- ЛЕВАЯ КОЛОНКА - Информация о пользователе (показывается всегда) -->
      <div class="lg:col-span-1">
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div class="flex flex-col items-center text-center mb-6">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4">
              {{ getUserInitials() }}
            </div>
            <h2 class="text-2xl font-bold text-white">{{ authStore.user?.name || 'Пользователь' }}</h2>
            <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold" :class="getRoleBadgeClass()">
              {{ getUserRoleText() }}
            </span>
          </div>
          
          <div class="space-y-3 border-t border-white/10 pt-6">
            <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p class="text-gray-400 text-xs">Email</p>
                <p class="text-white font-medium">{{ authStore.user?.email || '—' }}</p>
              </div>
            </div>
            
            <div v-if="authStore.user?.phone" class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p class="text-gray-400 text-xs">Телефон</p>
                <p class="text-white font-medium">{{ authStore.user?.phone }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p class="text-gray-400 text-xs">Дата регистрации</p>
                <p class="text-white font-medium">{{ formatDate(authStore.user?.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ПРАВАЯ КОЛОНКА - Контент (router-view) -->
      <div class="lg:col-span-2">
        <router-view />
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const getUserInitials = () => {
  const name = authStore.user?.name || 'U'
  return name.charAt(0).toUpperCase()
}

const getUserRoleText = () => {
  if (authStore.isCarrier) return 'Перевозчик'
  if (authStore.isShipper) return 'Заказчик'
  if (authStore.isAdmin) return 'Администратор'
  return 'Пользователь'
}

const getRoleBadgeClass = () => {
  if (authStore.isCarrier) return 'bg-green-500/20 text-green-300'
  if (authStore.isShipper) return 'bg-blue-500/20 text-blue-300'
  if (authStore.isAdmin) return 'bg-purple-500/20 text-purple-300'
  return 'bg-gray-500/20 text-gray-300'
}

const formatDate = (date) => {
  if (!date) return 'Неизвестно'
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchUser()
  }
})
</script>
