<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-white mb-8">Избранное</h1>
    
    <!-- Вкладки -->
    <div class="flex gap-4 mb-8 border-b border-white/20">
      <button
        @click="activeTab = 'orders'"
        :class="[
          'px-6 py-3 font-semibold transition-colors border-b-2',
          activeTab === 'orders'
            ? 'border-blue-400 text-blue-400'
            : 'border-transparent text-gray-400 hover:text-white'
        ]"
      >
        Избранные заказы
      </button>
      <button
        @click="activeTab = 'carriers'"
        :class="[
          'px-6 py-3 font-semibold transition-colors border-b-2',
          activeTab === 'carriers'
            ? 'border-blue-400 text-blue-400'
            : 'border-transparent text-gray-400 hover:text-white'
        ]"
      >
        Избранные перевозчики
      </button>
    </div>

    <!-- Избранные заказы -->
    <div v-if="activeTab === 'orders'">
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 animate-pulse">
          <div class="h-6 bg-white/20 rounded mb-4 w-3/4"></div>
          <div class="h-4 bg-white/10 rounded mb-2"></div>
          <div class="h-4 bg-white/10 rounded mb-4"></div>
        </div>
      </div>

      <div v-else-if="favoriteOrders.length === 0" class="text-center py-16 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
        <p class="text-gray-400 text-lg mb-4">Нет избранных заказов</p>
        <router-link to="/orders" class="text-blue-400 hover:text-blue-300">
          Смотреть заказы
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link 
          v-for="order in favoriteOrders" 
          :key="order.id"
          :to="`/orders/${order.id}`"
          class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors block relative"
        >
          <button 
            @click.prevent="removeFromFavorites(order.id, 'order')"
            class="absolute top-4 right-4 text-gray-400 hover:text-red-400 transition-colors"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <h3 class="text-xl font-semibold text-white mb-2">
            {{ order.pickup_address }} → {{ order.delivery_address }}
          </h3>
          <div class="text-gray-300 text-sm space-y-2 mb-4">
            <p>Вес: {{ order.weight_kg }} кг</p>
            <p>Дата: {{ formatDate(order.loading_date) }}</p>
          </div>
          <div class="text-2xl font-bold text-blue-400">
            {{ formatPrice(order.price) }} {{ order.currency || 'BYN' }}
          </div>
        </router-link>
      </div>
    </div>

    <!-- Избранные перевозчики -->
    <div v-if="activeTab === 'carriers'">
      <div v-if="favoriteCarriers.length === 0" class="text-center py-16 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
        <p class="text-gray-400 text-lg mb-4">Нет избранных перевозчиков</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          v-for="carrier in favoriteCarriers" 
          :key="carrier.id"
          class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 relative"
        >
          <button 
            @click="removeFromFavorites(carrier.id, 'carrier')"
            class="absolute top-4 right-4 text-gray-400 hover:text-red-400 transition-colors"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {{ carrier.company_name?.charAt(0) || 'C' }}
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-white">{{ carrier.company_name }}</h3>
              <div class="flex items-center gap-2 text-gray-400">
                <span>Рейтинг:</span>
                <span class="text-yellow-400">★</span>
                <span>{{ carrier.rating?.toFixed(1) || 'Нет отзывов' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/api/client'

const activeTab = ref('orders')
const loading = ref(true)
const favoriteOrders = ref([])
const favoriteCarriers = ref([])

const fetchFavorites = async () => {
  loading.value = true
  
  try {
    const [ordersRes, carriersRes] = await Promise.all([
      apiClient.get('/api/favorites/orders'),
      apiClient.get('/api/favorites/carriers')
    ])
    
    favoriteOrders.value = ordersRes.data
    favoriteCarriers.value = carriersRes.data
  } catch (error) {
    console.error('Failed to fetch favorites:', error)
  } finally {
    loading.value = false
  }
}

const removeFromFavorites = async (id, type) => {
  try {
    await apiClient.delete(`/api/favorites/${type}/${id}`)
    
    if (type === 'order') {
      favoriteOrders.value = favoriteOrders.value.filter(item => item.id !== id)
    } else {
      favoriteCarriers.value = favoriteCarriers.value.filter(item => item.id !== id)
    }
  } catch (error) {
    console.error('Failed to remove from favorites:', error)
  }
}

const formatPrice = (price) => {
  if (!price) return 'Договорная'
  return new Intl.NumberFormat('ru-RU').format(price)
}

const formatDate = (date) => {
  if (!date) return 'Не указана'
  return new Date(date).toLocaleDateString('ru-RU')
}

onMounted(() => {
  fetchFavorites()
})
</script>
