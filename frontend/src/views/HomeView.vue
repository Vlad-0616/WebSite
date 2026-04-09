<template>
  <div>
    <!-- Герой-секция -->
    <section class="container mx-auto px-4 py-20 text-center">
      <h1 class="text-5xl md:text-6xl font-bold text-white mb-6">
        Биржа грузоперевозок
      </h1>
      <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
        Прямое взаимодействие грузовладельцев и перевозчиков. Быстро, прозрачно, эффективно.
      </p>
      
      <div class="flex gap-4 justify-center">
        <router-link 
          v-if="!authStore.isAuthenticated"
          to="/auth/register" 
          class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
        >
          Начать работу
        </router-link>
        <router-link 
          v-else
          to="/orders" 
          class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
        >
          Найти заказы
        </router-link>
        <router-link 
          to="/orders" 
          class="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors border border-white/20"
        >
          Смотреть заказы
        </router-link>
      </div>
    </section>

    <!-- Быстрый поиск -->
    <section class="container mx-auto px-4 py-12">
      <div class="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h2 class="text-2xl font-bold text-white mb-6">Быстрый поиск</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-gray-300 mb-2">Откуда</label>
            <input 
              v-model="searchFrom"
              type="text" 
              placeholder="Минск"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-gray-300 mb-2">Куда</label>
            <input 
              v-model="searchTo"
              type="text" 
              placeholder="Брест"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex items-end">
            <button 
              @click="handleSearch"
              class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Найти
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Последние заказы -->
    <section class="container mx-auto px-4 py-12">
      <h2 class="text-3xl font-bold text-white mb-8">Последние заказы</h2>
      
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 animate-pulse">
          <div class="h-6 bg-white/20 rounded mb-4 w-3/4"></div>
          <div class="h-4 bg-white/10 rounded mb-2"></div>
          <div class="h-4 bg-white/10 rounded mb-4"></div>
          <div class="h-8 bg-white/20 rounded w-1/2"></div>
        </div>
      </div>

      <div v-else-if="orders.length === 0" class="text-center py-12">
        <p class="text-gray-400 text-lg mb-4">Нет активных заказов</p>
        <router-link 
          v-if="authStore.isAuthenticated"
          to="/orders" 
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Разместить заказ
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link 
          v-for="order in orders" 
          :key="order.id"
          :to="`/orders/${order.id}`"
          class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
        >
          <h3 class="text-xl font-semibold text-white mb-2">
            {{ order.pickup_address }} → {{ order.delivery_address }}
          </h3>
          <div class="text-gray-300 text-sm space-y-1 mb-4">
            <p>Вес: {{ order.weight_kg }} кг</p>
            <p>Дата: {{ new Date(order.loading_date).toLocaleDateString('ru-RU') }}</p>
          </div>
          <div class="text-2xl font-bold text-blue-400">
            {{ order.price }} {{ order.currency || 'BYN' }}
          </div>
        </router-link>
      </div>
    </section>

    <!-- Популярные направления -->
    <section class="container mx-auto px-4 py-12">
      <h2 class="text-3xl font-bold text-white mb-8">Популярные направления</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div 
          v-for="route in popularRoutes" 
          :key="route.id"
          class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
        >
          <h3 class="text-lg font-semibold text-white mb-2">{{ route.from }}</h3>
          <p class="text-gray-300 text-sm mb-2">→ {{ route.to }}</p>
          <p class="text-blue-400 font-bold">{{ route.count }} заказов/мес</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/client'

const authStore = useAuthStore()
const loading = ref(true)
const orders = ref([])
const popularRoutes = ref([])
const searchFrom = ref('')
const searchTo = ref('')

const fetchOrders = async () => {
  try {
    const response = await apiClient.get('/api/orders', { 
      params: { sort: 'latest', limit: 6 } 
    })
    orders.value = response.data
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    loading.value = false
  }
}

const fetchPopularRoutes = async () => {
  try {
    const response = await apiClient.get('/api/statistics/popular-routes', { 
      params: { limit: 5 } 
    })
    popularRoutes.value = response.data
  } catch (error) {
    console.error('Failed to fetch popular routes:', error)
  }
}

const handleSearch = () => {
  const params = new URLSearchParams()
  if (searchFrom.value) params.set('from', searchFrom.value)
  if (searchTo.value) params.set('to', searchTo.value)
  
  window.location.href = `/orders?${params.toString()}`
}

onMounted(() => {
  fetchOrders()
  fetchPopularRoutes()
})
</script>
