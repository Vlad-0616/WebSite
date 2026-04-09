<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-white mb-8">Каталог заказов</h1>
    
    <!-- Поисковая строка -->
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-gray-300 mb-2">Откуда</label>
          <input 
            v-model="filters.from"
            @input="debounceSearch"
            type="text" 
            placeholder="Город отправления"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-gray-300 mb-2">Куда</label>
          <input 
            v-model="filters.to"
            @input="debounceSearch"
            type="text" 
            placeholder="Город доставки"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex items-end">
          <button 
            @click="resetFilters"
            class="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors border border-white/20"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>
    </div>

    <!-- Панель фильтров -->
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
      <button 
        @click="showFilters = !showFilters"
        class="flex items-center justify-between w-full text-white font-semibold"
      >
        <span>Фильтры</span>
        <svg 
          class="w-5 h-5 transition-transform"
          :class="{ 'rotate-180': showFilters }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div v-show="showFilters" class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-gray-300 mb-2">Мин. вес (кг)</label>
          <input 
            v-model.number="filters.weight_min"
            @change="fetchOrders"
            type="number" 
            placeholder="1000"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-gray-300 mb-2">Макс. вес (кг)</label>
          <input 
            v-model.number="filters.weight_max"
            @change="fetchOrders"
            type="number" 
            placeholder="5000"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-gray-300 mb-2">Тип кузова</label>
          <select 
            v-model="filters.truck_type"
            @change="fetchOrders"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все типы</option>
            <option value="refrigerator">Рефрижератор</option>
            <option value="tent">Тент</option>
            <option value="flatbed">Платформа</option>
            <option value="container">Контейнер</option>
          </select>
        </div>
        <div>
          <label class="block text-gray-300 mb-2">Сортировка</label>
          <select 
            v-model="filters.sort"
            @change="fetchOrders"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="latest">По дате</option>
            <option value="price_desc">По цене (убыв.)</option>
            <option value="price_asc">По цене (возр.)</option>
            <option value="weight_desc">По весу (убыв.)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Список заказов -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 animate-pulse">
        <div class="h-6 bg-white/20 rounded mb-4 w-3/4"></div>
        <div class="h-4 bg-white/10 rounded mb-2"></div>
        <div class="h-4 bg-white/10 rounded mb-4"></div>
        <div class="h-8 bg-white/20 rounded w-1/2"></div>
      </div>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-16 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
      <p class="text-gray-400 text-lg mb-4">Нет заказов по заданным фильтрам</p>
      <button 
        @click="resetFilters"
        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Сбросить фильтры
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link 
        v-for="order in orders" 
        :key="order.id"
        :to="`/orders/${order.id}`"
        class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors block"
      >
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-xl font-semibold text-white flex-1">
            {{ order.pickup_city || order.pickup_address }} → {{ order.delivery_city || order.delivery_address }}
          </h3>
          <span 
            :class="[
              'px-3 py-1 rounded-full text-xs font-semibold',
              order.status === 'active' ? 'bg-green-500/20 text-green-300' :
              order.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
              'bg-gray-500/20 text-gray-300'
            ]"
          >
            {{ getStatusText(order.status) }}
          </span>
        </div>
        
        <div class="text-gray-300 text-sm space-y-2 mb-4">
          <div class="flex justify-between">
            <span>Вес:</span>
            <span class="font-semibold">{{ order.weight_kg }} кг</span>
          </div>
          <div class="flex justify-between">
            <span>Дата загрузки:</span>
            <span class="font-semibold">{{ formatDate(order.loading_date) }}</span>
          </div>
          <div v-if="order.truck_type" class="flex justify-between">
            <span>Тип кузова:</span>
            <span class="font-semibold">{{ getTruckTypeText(order.truck_type) }}</span>
          </div>
        </div>
        
        <div class="text-2xl font-bold text-blue-400">
          {{ formatPrice(order.price) }} {{ order.currency || 'BYN' }}
        </div>
      </router-link>
    </div>

    <div v-if="!loading && orders.length > 0" class="mt-8 flex justify-center gap-2">
      <button 
        v-for="page in totalPages" 
        :key="page"
        @click="changePage(page)"
        :class="[
          'px-4 py-2 rounded-lg transition-colors',
          currentPage === page 
            ? 'bg-blue-500 text-white' 
            : 'bg-white/10 text-white hover:bg-white/20'
        ]"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/api/client'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const orders = ref([])
const showFilters = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

const filters = ref({
  from: route.query.from || '',
  to: route.query.to || '',
  weight_min: route.query.weight_min || null,
  weight_max: route.query.weight_max || null,
  truck_type: route.query.truck_type || '',
  sort: route.query.sort || 'latest'
})

let searchTimeout = null

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchOrders()
  }, 500)
}

const fetchOrders = async () => {
  loading.value = true
  
  try {
    const params = {
      page: currentPage.value,
      limit: 20,
      sort: filters.value.sort,
      status: 'active'
    }
    
    if (filters.value.from) params.from = filters.value.from
    if (filters.value.to) params.to = filters.value.to
    if (filters.value.weight_min) params.weight_min = filters.value.weight_min
    if (filters.value.weight_max) params.weight_max = filters.value.weight_max
    if (filters.value.truck_type) params.truck_type = filters.value.truck_type
    
    const response = await apiClient.get('/api/orders', { params })
    orders.value = response.data.orders || response.data
    totalPages.value = response.data.pages || 1
    
    // Обновляем URL
    router.push({ query: { ...filters.value } })
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    from: '',
    to: '',
    weight_min: null,
    weight_max: null,
    truck_type: '',
    sort: 'latest'
  }
  currentPage.value = 1
  fetchOrders()
}

const changePage = (page) => {
  currentPage.value = page
  fetchOrders()
}

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
    container: 'Контейнер'
  }
  return typeMap[type] || type
}

const formatDate = (date) => {
  if (!date) return 'Не указана'
  return new Date(date).toLocaleDateString('ru-RU')
}

const formatPrice = (price) => {
  if (!price) return 'Договорная'
  return new Intl.NumberFormat('ru-RU').format(price)
}

onMounted(() => {
  fetchOrders()
})
</script>
