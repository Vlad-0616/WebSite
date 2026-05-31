<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-white">Мои ставки</h2>
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
      <div v-for="i in 2" :key="i" class="bg-white/10 rounded-xl p-6 animate-pulse">
        <div class="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
        <div class="h-4 bg-white/10 rounded w-1/2"></div>
      </div>
    </div>

    <div v-else-if="bids.length === 0 && !loading" class="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
      <svg class="w-20 h-20 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-gray-400 text-lg mb-4">У вас пока нет активных ставок</p>
      <router-link 
        to="/orders"
        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors inline-block"
      >
        Найти заказы
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="bid in bids" 
        :key="bid.id"
        class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-white mb-2">
              {{ bid.order?.pickup_address || 'Заказ' }} → {{ bid.order?.delivery_address || '' }}
            </h3>
            <div class="flex gap-4 text-sm">
              <span class="text-blue-400 font-bold">{{ formatPrice(bid.price) }} BYN</span>
              <span :class="bid.status === 'active' ? 'text-green-400' : 'text-gray-400'">
                {{ getStatusText(bid.status) }}
              </span>
            </div>
            <p class="text-gray-400 text-xs mt-2">{{ formatDate(bid.created_at) }}</p>
          </div>
          <div class="flex gap-2">
            <router-link 
              :to="`/orders/${bid.order_id}`"
              class="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm"
            >
              Подробнее
            </router-link>
            <button 
              v-if="bid.status === 'active'"
              @click="withdrawBid(bid.id)"
              class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm"
            >
              Отозвать
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import apiClient from '@/api/client'

const authStore = useAuthStore()
const appStore = useAppStore()
const loading = ref(true)
const bids = ref([])

const getStatusText = (status) => {
  const map = { active: 'Активна', accepted: 'Принята', rejected: 'Отклонена', withdrawn: 'Отозвана' }
  return map[status] || status
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU')
}

const fetchBids = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/api/bids/my')
    bids.value = response.data
  } catch (error) {
    console.error('Failed to fetch bids:', error)
    appStore.setError('Не удалось загрузить ставки')
  } finally {
    loading.value = false
  }
}

const withdrawBid = async (bidId) => {
  if (!confirm('Вы уверены, что хотите отозвать эту ставку?')) return
  
  try {
    await apiClient.delete(`/api/bids/${bidId}`)
    await fetchBids()
    appStore.addNotification({ type: 'success', message: 'Ставка отозвана' })
  } catch (error) {
    console.error('Failed to withdraw bid:', error)
    appStore.setError('Не удалось отозвать ставку')
  }
}

onMounted(() => {
  fetchBids()
})
</script>
