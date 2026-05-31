<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-white">Мои заказы (в работе)</h2>
      <router-link 
        to="/orders"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Найти новые заказы
      </router-link>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 animate-pulse">
        <div class="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
        <div class="h-4 bg-white/10 rounded w-1/2"></div>
      </div>
    </div>

    <div v-else-if="orders.length === 0" class="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
      <svg class="w-20 h-20 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-gray-400 text-lg mb-4">У вас нет активных заказов</p>
      <router-link 
        to="/orders"
        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors inline-block"
      >
        Найти заказы
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="order in orders" 
        :key="order.id"
        class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
      >
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3 flex-wrap">
              <h3 class="text-lg font-semibold text-white">
                {{ order.pickup_address }} → {{ order.delivery_address }}
              </h3>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                В работе
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
              <div>
                <p class="text-gray-400 text-xs">Вес</p>
                <p class="text-white font-medium">{{ order.weight_kg }} кг</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs">Цена</p>
                <p class="text-blue-400 font-bold">{{ formatPrice(order.price) }} {{ order.currency || 'BYN' }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs">Дата погрузки</p>
                <p class="text-white">{{ formatDate(order.loading_date) }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs">Адрес погрузки</p>
                <p class="text-white text-sm">{{ order.pickup_address }}</p>
              </div>
              <div>
                <p class="text-gray-400 text-xs">Адрес доставки</p>
                <p class="text-white text-sm">{{ order.delivery_address }}</p>
              </div>
              <div v-if="order.assigned_at">
                <p class="text-gray-400 text-xs">Назначен</p>
                <p class="text-white">{{ formatDate(order.assigned_at) }}</p>
              </div>
            </div>

            <!-- Информация о заказчике -->
            <div class="mt-3 p-3 bg-white/5 rounded-lg">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="text-gray-400 text-xs">Заказчик:</span>
                <span class="text-white text-sm">{{ order.shipper?.name || 'ID: ' + order.shipper_id?.slice(0, 8) }}</span>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <router-link 
              :to="`/orders/${order.id}`"
              class="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-sm"
            >
              Подробнее
            </router-link>
            
            <!-- Кнопка отказа от заказа -->
            <button 
              @click="cancelAssignment(order.id)"
              :disabled="cancellingId === order.id"
              class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {{ cancellingId === order.id ? 'Отмена...' : 'Отказаться' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { ordersAPI } from '@/api/orders'

const appStore = useAppStore()
const loading = ref(true)
const orders = ref([])
const cancellingId = ref(null)

const fetchMyActiveOrders = async () => {
  loading.value = true
  try {
    const response = await ordersAPI.getMyActiveOrders()
    orders.value = response.data
  } catch (error) {
    console.error('Failed to fetch active orders:', error)
    appStore.addNotification({ 
      type: 'error', 
      message: error.response?.data?.message || 'Не удалось загрузить заказы' 
    })
  } finally {
    loading.value = false
  }
}

const cancelAssignment = async (orderId) => {
  if (!confirm('Вы уверены, что хотите отказаться от этого заказа? Он снова станет доступен другим перевозчикам.')) return
  
  cancellingId.value = orderId
  
  try {
    await ordersAPI.cancelAssignment(orderId)
    await fetchMyActiveOrders()
    appStore.addNotification({ type: 'success', message: 'Вы отказались от заказа' })
  } catch (error) {
    console.error('Failed to cancel assignment:', error)
    appStore.addNotification({ 
      type: 'error', 
      message: error.response?.data?.message || 'Не удалось отказаться от заказа' 
    })
  } finally {
    cancellingId.value = null
  }
}

const formatPrice = (price) => {
  if (!price) return 'Договорная'
  return new Intl.NumberFormat('ru-RU').format(price)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchMyActiveOrders()
})
</script>
