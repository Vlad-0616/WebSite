<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-4xl font-bold text-white">Мои заказы</h1>
      <router-link 
        to="/orders/create"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Новый заказ
      </router-link>
    </div>
    
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 animate-pulse">
        <div class="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
        <div class="h-4 bg-white/10 rounded w-1/2"></div>
      </div>
    </div>

    <div v-else-if="orders.length === 0" class="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
      <svg class="w-20 h-20 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-400 text-lg mb-4">У вас пока нет заказов</p>
      <router-link 
        to="/orders/create"
        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors inline-block"
      >
        Создать первый заказ
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="order in orders" 
        :key="order.id"
        class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2 flex-wrap">
              <h3 class="text-xl font-semibold text-white">
                {{ order.pickup_address }} → {{ order.delivery_address }}
              </h3>
              <span 
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  order.status === 'active' ? 'bg-green-500/20 text-green-300' :
                  order.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                  order.status === 'completed' ? 'bg-gray-500/20 text-gray-300' :
                  'bg-red-500/20 text-red-300'
                ]"
              >
                {{ getStatusText(order.status) }}
              </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mt-4">
              <div>
                <p class="text-gray-400">Вес</p>
                <p class="text-white font-semibold">{{ order.weight_kg }} кг</p>
              </div>
              <div>
                <p class="text-gray-400">Цена</p>
                <p class="text-blue-400 font-bold">{{ formatPrice(order.price) }} {{ order.currency || 'BYN' }}</p>
              </div>
              <div>
                <p class="text-gray-400">Дата погрузки</p>
                <p class="text-white">{{ formatDate(order.loading_date) }}</p>
              </div>
              <div>
                <p class="text-gray-400">Создан</p>
                <p class="text-white">{{ formatDate(order.created_at) }}</p>
              </div>
            </div>

            <!-- Информация о назначенном перевозчике -->
            <div v-if="order.carrier_id && order.status === 'in_progress'" class="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M5 10v11h14V10" />
                </svg>
                <span class="text-blue-300 text-sm">Назначен перевозчик ID: {{ order.carrier_id.slice(0, 8) }}...</span>
              </div>
              <p class="text-gray-400 text-xs mt-1">Заказ в работе</p>
            </div>
          </div>
          
          <div class="flex gap-2 ml-4">
            <router-link 
              :to="`/orders/${order.id}`"
              class="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-sm"
            >
              Подробнее
            </router-link>
            
            <!-- Отменить активный заказ -->
            <button 
              v-if="order.status === 'active'"
              @click="cancelOrder(order.id)"
              :disabled="cancellingId === order.id"
              class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {{ cancellingId === order.id ? 'Отмена...' : 'Отменить' }}
            </button>
            
            <!-- Отменить назначение (если заказ в работе) -->
            <button 
              v-if="order.status === 'in_progress'"
              @click="cancelAssignment(order.id)"
              :disabled="cancellingId === order.id"
              class="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {{ cancellingId === order.id ? 'Отмена...' : 'Отменить перевозчика' }}
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
import apiClient from '@/api/client'
import { ordersAPI } from '@/api/orders'

const appStore = useAppStore()
const loading = ref(true)
const orders = ref([])
const cancellingId = ref(null)

const fetchMyOrders = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/api/orders/my')
    orders.value = response.data
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    appStore.setError('Не удалось загрузить заказы')
  } finally {
    loading.value = false
  }
}

const cancelOrder = async (id) => {
  if (!confirm('Вы уверены, что хотите отменить этот заказ?')) return
  
  cancellingId.value = id
  
  try {
    await apiClient.delete(`/api/orders/${id}`)
    await fetchMyOrders()
    appStore.addNotification({ type: 'success', message: 'Заказ отменён' })
  } catch (error) {
    console.error('Failed to cancel order:', error)
    appStore.setError('Не удалось отменить заказ')
  } finally {
    cancellingId.value = null
  }
}

const cancelAssignment = async (orderId) => {
  if (!confirm('Вы уверены, что хотите отменить назначение перевозчика? Заказ снова станет доступен для всех.')) return
  
  cancellingId.value = orderId
  
  try {
    await ordersAPI.cancelAssignment(orderId)
    await fetchMyOrders()
    appStore.addNotification({ type: 'success', message: 'Назначение отменено, заказ снова в каталоге' })
  } catch (error) {
    console.error('Failed to cancel assignment:', error)
    appStore.setError(error.response?.data?.message || 'Не удалось отменить назначение')
  } finally {
    cancellingId.value = null
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

const formatPrice = (price) => {
  if (!price) return 'Договорная'
  return new Intl.NumberFormat('ru-RU').format(price)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU')
}

onMounted(() => {
  fetchMyOrders()
})
</script>