<template>
  <div>
    <section class="container mx-auto px-4 py-12 md:py-20 text-center">
      <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
        Биржа грузоперевозок
      </h1>
      <p class="text-base md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto px-2">
        Прямое взаимодействие грузовладельцев и перевозчиков. Быстро, прозрачно, эффективно.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
        <router-link 
          v-if="!authStore.isAuthenticated"
          to="/auth/register" 
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg text-base md:text-lg font-semibold transition-colors text-center"
        >
          Начать работу
        </router-link>
        <router-link 
          v-else
          to="/orders" 
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg text-base md:text-lg font-semibold transition-colors text-center"
        >
          Найти заказы
        </router-link>
        <router-link 
          to="/orders" 
          class="bg-white/10 hover:bg-white/20 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg text-base md:text-lg font-semibold transition-colors border border-white/20 text-center"
        >
          Смотреть заказы
        </router-link>
      </div>
    </section>

    <!-- Быстрый поиск -->
    <section class="container mx-auto px-4 py-8 md:py-12">
      <div class="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-8 border border-white/20">
        <h2 class="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Быстрый поиск</h2>
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-gray-300 mb-2">Откуда</label>
            <input 
              v-model="searchFrom"
              type="text" 
              placeholder="Минск"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex-1">
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
    <section class="container mx-auto px-4 py-8 md:py-12">
      <h2 class="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">Последние заказы</h2>
      
      <!-- Скелетоны загрузки -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div v-for="i in 6" :key="i" class="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20 animate-pulse">
          <div class="h-5 md:h-6 bg-white/20 rounded mb-3 md:mb-4 w-3/4"></div>
          <div class="h-3 md:h-4 bg-white/10 rounded mb-2"></div>
          <div class="h-3 md:h-4 bg-white/10 rounded mb-3 md:mb-4"></div>
          <div class="h-6 md:h-8 bg-white/20 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Нет заказов -->
      <div v-else-if="orders.length === 0" class="text-center py-8 md:py-12 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
        <p class="text-gray-400 text-base md:text-lg mb-4">Нет активных заказов</p>
        <router-link 
          v-if="authStore.isAuthenticated"
          to="/orders/create" 
          class="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 md:px-6 md:py-3 rounded-lg transition-colors text-sm md:text-base"
        >
          Разместить заказ
        </router-link>
      </div>

      <!-- Список заказов -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <router-link 
          v-for="order in orders" 
          :key="order.id"
          :to="`/orders/${order.id}`"
          class="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-colors block"
        >
          <div class="flex items-start justify-between mb-3 md:mb-4">
            <h3 class="text-base md:text-lg font-semibold text-white flex-1 line-clamp-2">
              {{ order.pickup_address }} → {{ order.delivery_address }}
            </h3>
            <span 
              :class="[
                'px-2 py-1 rounded-full text-xs font-semibold ml-2 whitespace-nowrap',
                order.status === 'active' ? 'bg-green-500/20 text-green-300' :
                order.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                'bg-gray-500/20 text-gray-300'
              ]"
            >
              {{ getStatusText(order.status) }}
            </span>
          </div>
          
          <div class="text-gray-300 text-xs md:text-sm space-y-1 md:space-y-2 mb-3 md:mb-4">
            <div class="flex justify-between">
              <span>Вес:</span>
              <span class="font-semibold">{{ formatNumber(order.weight_kg) }} кг</span>
            </div>
            <div v-if="order.truck_type" class="flex justify-between">
              <span>Тип кузова:</span>
              <span class="font-semibold text-xs md:text-sm">{{ getTruckTypeText(order.truck_type) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Дата:</span>
              <span class="font-semibold text-xs md:text-sm">{{ formatDate(order.loading_date) || 'договорная' }}</span>
            </div>
          </div>
          
          <div class="text-xl md:text-2xl font-bold text-blue-400">
            {{ formatNumber(order.price) }} {{ order.currency || 'BYN' }}
          </div>
        </router-link>
      </div>
    </section>

    <!-- Популярные направления -->
    <section class="container mx-auto px-4 py-8 md:py-12">
      <h2 class="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">Популярные направления</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <div 
          v-for="route in popularRoutes" 
          :key="route.id"
          class="bg-white/10 backdrop-blur-lg rounded-xl p-3 md:p-6 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer text-center md:text-left"
          @click="searchRoute(route.from, route.to)"
        >
          <h3 class="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">{{ route.from }}</h3>
          <p class="text-gray-300 text-xs md:text-sm mb-1 md:mb-2">→ {{ route.to }}</p>
          <p class="text-blue-400 font-bold text-sm md:text-base">{{ route.count }} заказов</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/client'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(true)
const orders = ref([])
const popularRoutes = ref([])
const searchFrom = ref('')
const searchTo = ref('')

const getStatusText = (status) => {
  const statusMap = {
    active: 'Активен',
    in_progress: 'В работе',
    completed: 'Выполнен',
    canceled: 'Отменён'
  }
  return statusMap[status] || status
}

const getTruckTypeText = (type) => {
  const typeMap = {
    refrigerator: 'Рефрижератор',
    tent: 'Тент',
    flatbed: 'Платформа',
    container: 'Контейнеровоз',
    curtain: 'Штора',
    isothermal: 'Изотермический'
  }
  return typeMap[type] || type
}

const formatNumber = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('ru-RU').format(value)
}

const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}

const fetchOrders = async () => {
  loading.value = true
  
  try {
    const response = await apiClient.get('/api/orders', { 
      params: { sort: 'latest', limit: 6, status: 'active' }
    })
    
    if (Array.isArray(response.data)) {
      orders.value = response.data
    } 
    else if (response.data.orders && Array.isArray(response.data.orders)) {
      orders.value = response.data.orders
    }
    else {
      orders.value = []
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    orders.value = []
  } finally {
    loading.value = false
  }
}

const fetchPopularRoutes = async () => {
  try {
    const response = await apiClient.get('/api/statistics/popular-routes', { 
      params: { limit: 5 } 
    })
    popularRoutes.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch popular routes:', error)
    popularRoutes.value = []
  }
}

const handleSearch = () => {
  const params = new URLSearchParams()
  if (searchFrom.value) params.set('from', searchFrom.value)
  if (searchTo.value) params.set('to', searchTo.value)
  
  router.push(`/orders?${params.toString()}`)
}

const searchRoute = (from, to) => {
  searchFrom.value = from
  searchTo.value = to
  handleSearch()
}

onMounted(() => {
  fetchOrders()
  fetchPopularRoutes()
})
</script>
