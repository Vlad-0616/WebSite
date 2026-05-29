<!-- frontend/src/views/orders/OrdersListView.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-white mb-8">Каталог заказов</h1>
    
    <!-- Простые фильтры -->
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-gray-300 mb-2">Откуда</label>
          <input 
            v-model="filters.from"
            @input="debounceSearch"
            type="text" 
            placeholder="Минск"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-gray-300 mb-2">Куда</label>
          <input 
            v-model="filters.to"
            @input="debounceSearch"
            type="text" 
            placeholder="Брест"
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

    <!-- Расширенные фильтры -->
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
      <button 
        @click="showFilters = !showFilters"
        class="flex items-center justify-between w-full text-white font-semibold"
      >
        <span>Расширенные фильтры</span>
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
      
      <div v-show="showFilters" class="mt-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <option value="container">Контейнеровоз</option>
              <option value="curtain">Штора</option>
              <option value="isothermal">Изотермический</option>
            </select>
          </div>
          <div>
            <label class="block text-gray-300 mb-2">Вес от (кг)</label>
            <input 
              v-model.number="filters.weight_min"
              @change="fetchOrders"
              type="number" 
              placeholder="1000"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-gray-300 mb-2">Вес до (кг)</label>
            <input 
              v-model.number="filters.weight_max"
              @change="fetchOrders"
              type="number" 
              placeholder="20000"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-gray-300 mb-2">Цена от (BYN)</label>
            <input 
              v-model.number="filters.price_min"
              @change="fetchOrders"
              type="number" 
              placeholder="100"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-gray-300 mb-2">Цена до (BYN)</label>
            <input 
              v-model.number="filters.price_max"
              @change="fetchOrders"
              type="number" 
              placeholder="5000"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Активные фильтры -->
    <div v-if="activeFiltersCount > 0" class="flex flex-wrap gap-2 mb-6">
      <span class="text-gray-300 text-sm">Активные фильтры:</span>
      <span 
        v-for="filter in activeFiltersList" 
        :key="filter.key"
        class="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
      >
        {{ filter.label }}
        <button @click="removeFilter(filter.key)" class="hover:text-white">×</button>
      </span>
      <button @click="resetFilters" class="text-red-400 hover:text-red-300 text-sm ml-2">
        Сбросить всё
      </button>
    </div>

    <!-- Список заказов -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 animate-pulse">
        <div class="h-6 bg-white/20 rounded mb-4 w-3/4"></div>
        <div class="h-4 bg-white/10 rounded mb-2"></div>
        <div class="h-4 bg-white/10 rounded mb-4"></div>
      </div>
    </div>

    <div v-else-if="orders.length === 0" class="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
      <svg class="w-20 h-20 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
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
          <h3 class="text-lg font-semibold text-white flex-1 line-clamp-2">
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
        
        <div class="text-gray-300 text-sm space-y-2 mb-4">
          <div class="flex justify-between">
            <span>Вес:</span>
            <span class="font-semibold">{{ formatNumber(order.weight_kg) }} кг</span>
          </div>
          <div v-if="order.truck_type" class="flex justify-between">
            <span>Тип кузова:</span>
            <span class="font-semibold">{{ getTruckTypeText(order.truck_type) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Дата:</span>
            <span class="font-semibold">{{ formatDate(order.loading_date) || 'договорная' }}</span>
          </div>
        </div>
        
        <div class="text-2xl font-bold text-blue-400">
          {{ formatNumber(order.price) }} {{ order.currency || 'BYN' }}
        </div>

        <!-- Кнопка принятия заказа для перевозчика -->
        <button 
          v-if="authStore.isCarrier && order.status === 'active' && order.shipper_id !== authStore.user?.id"
          @click.stop="acceptOrder(order.id)"
          :disabled="acceptingOrderId === order.id"
          class="mt-4 w-full bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50"
        >
          {{ acceptingOrderId === order.id ? 'Принятие...' : 'Принять заказ' }}
        </button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import apiClient from '@/api/client'
import { ordersAPI } from '@/api/orders'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const loading = ref(true)
const orders = ref([])
const showFilters = ref(false)
const acceptingOrderId = ref(null)

const filters = ref({
  from: route.query.from || '',
  to: route.query.to || '',
  truck_type: route.query.truck_type || '',
  weight_min: route.query.weight_min ? Number(route.query.weight_min) : null,
  weight_max: route.query.weight_max ? Number(route.query.weight_max) : null,
  price_min: route.query.price_min ? Number(route.query.price_min) : null,
  price_max: route.query.price_max ? Number(route.query.price_max) : null
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.from) count++
  if (filters.value.to) count++
  if (filters.value.truck_type) count++
  if (filters.value.weight_min) count++
  if (filters.value.weight_max) count++
  if (filters.value.price_min) count++
  if (filters.value.price_max) count++
  return count
})

const activeFiltersList = computed(() => {
  const list = []
  if (filters.value.from) list.push({ key: 'from', label: `Откуда: ${filters.value.from}` })
  if (filters.value.to) list.push({ key: 'to', label: `Куда: ${filters.value.to}` })
  if (filters.value.truck_type) list.push({ key: 'truck_type', label: `Тип: ${getTruckTypeText(filters.value.truck_type)}` })
  if (filters.value.weight_min) list.push({ key: 'weight_min', label: `Вес от: ${filters.value.weight_min} кг` })
  if (filters.value.weight_max) list.push({ key: 'weight_max', label: `Вес до: ${filters.value.weight_max} кг` })
  if (filters.value.price_min) list.push({ key: 'price_min', label: `Цена от: ${filters.value.price_min} BYN` })
  if (filters.value.price_max) list.push({ key: 'price_max', label: `Цена до: ${filters.value.price_max} BYN` })
  return list
})

let searchTimeout = null

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchOrders()
  }, 500)
}

const removeFilter = (key) => {
  filters.value[key] = ''
  fetchOrders()
}

const fetchOrders = async () => {
  loading.value = true
  
  try {
    const params = { status: 'active', sort: 'latest', limit: 20 }
    Object.entries(filters.value).forEach(([key, val]) => {
      if (val && val !== '') params[key] = val
    })
    
    const response = await apiClient.get('/api/orders', { params })
    orders.value = Array.isArray(response.data) ? response.data : (response.data.orders || [])
    
    const queryParams = {}
    Object.entries(filters.value).forEach(([key, val]) => {
      if (val && val !== '') queryParams[key] = val
    })
    router.replace({ query: queryParams })
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    orders.value = []
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    from: '',
    to: '',
    truck_type: '',
    weight_min: null,
    weight_max: null,
    price_min: null,
    price_max: null
  }
  fetchOrders()
}

const acceptOrder = async (orderId) => {
  if (!confirm('Вы уверены, что хотите принять этот заказ?')) return
  
  acceptingOrderId.value = orderId
  
  try {
    await ordersAPI.acceptOrder(orderId)
    appStore.addNotification({ type: 'success', message: 'Заказ принят!' })
    await fetchOrders()
  } catch (error) {
    console.error('Failed to accept order:', error)
    appStore.addNotification({ 
      type: 'error', 
      message: error.response?.data?.message || 'Не удалось принять заказ' 
    })
  } finally {
    acceptingOrderId.value = null
  }
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

onMounted(() => {
  fetchOrders()
})
</script>
