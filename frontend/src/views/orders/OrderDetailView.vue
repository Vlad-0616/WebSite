<template>
  <div v-if="loading" class="container mx-auto px-4 py-8">
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 animate-pulse">
      <div class="h-8 bg-white/20 rounded mb-6 w-3/4"></div>
      <div class="h-4 bg-white/10 rounded mb-4"></div>
      <div class="h-4 bg-white/10 rounded mb-4"></div>
    </div>
  </div>

  <div v-else-if="!order" class="container mx-auto px-4 py-8">
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
      <p class="text-gray-400 text-xl">Заказ не найден</p>
      <router-link to="/orders" class="text-blue-400 hover:text-blue-300 mt-4 inline-block">
        Вернуться к списку заказов
      </router-link>
    </div>
  </div>

  <div v-else class="container mx-auto px-4 py-8">
    <!-- Заголовок -->
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">
            {{ order.pickup_city || order.pickup_address }} → {{ order.delivery_city || order.delivery_address }}
          </h1>
          <p class="text-gray-400">Заказ #{{ order.id.slice(0, 8) }}</p>
        </div>
        <span 
          :class="[
            'px-4 py-2 rounded-full text-sm font-semibold',
            order.status === 'active' ? 'bg-green-500/20 text-green-300' :
            order.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
            'bg-gray-500/20 text-gray-300'
          ]"
        >
          {{ getStatusText(order.status) }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Детали груза -->
        <div>
          <h2 class="text-xl font-semibold text-white mb-4">Детали груза</h2>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-400">Вес:</span>
              <span class="text-white font-semibold">{{ order.weight_kg }} кг</span>
            </div>
            <div v-if="order.volume_m3" class="flex justify-between">
              <span class="text-gray-400">Объём:</span>
              <span class="text-white font-semibold">{{ order.volume_m3 }} м³</span>
            </div>
            <div v-if="order.dimensions" class="flex justify-between">
              <span class="text-gray-400">Габариты:</span>
              <span class="text-white font-semibold">{{ order.dimensions }}</span>
            </div>
            <div v-if="order.loading_type" class="flex justify-between">
              <span class="text-gray-400">Тип погрузки:</span>
              <span class="text-white font-semibold">{{ getLoadingTypeText(order.loading_type) }}</span>
            </div>
          </div>
        </div>

        <!-- Финансы -->
        <div>
          <h2 class="text-xl font-semibold text-white mb-4">Финансы</h2>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-400">Цена:</span>
              <span class="text-blue-400 font-bold text-2xl">
                {{ formatPrice(order.price) }} {{ order.currency || 'BYN' }}
              </span>
            </div>
            <div v-if="order.payment_terms" class="flex justify-between">
              <span class="text-gray-400">Условия оплаты:</span>
              <span class="text-white">{{ order.payment_terms }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Требования к транспорту -->
    <div v-if="order.truck_type || order.trailer_type" class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
      <h2 class="text-xl font-semibold text-white mb-4">Требования к транспорту</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-if="order.truck_type">
          <p class="text-gray-400 mb-2">Тип прицепа:</p>
          <p class="text-white font-semibold">{{ getTruckTypeText(order.truck_type) }}</p>
        </div>
        <div v-if="order.required_documents">
          <p class="text-gray-400 mb-2">Документы:</p>
          <p class="text-white">{{ order.required_documents }}</p>
        </div>
      </div>
    </div>

    <!-- Заказчик -->
    <div v-if="order.shipper" class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
      <h2 class="text-xl font-semibold text-white mb-4">Заказчик</h2>
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
          {{ order.shipper.company_name?.charAt(0) || 'U' }}
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-white">{{ order.shipper.company_name }}</h3>
          <div class="flex items-center gap-2 text-gray-400">
            <span>Рейтинг:</span>
            <span class="text-yellow-400">★</span>
            <span>{{ order.shipper.rating?.toFixed(1) || 'Нет отзывов' }}</span>
          </div>
        </div>
        <button class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors">
          Позвонить
        </button>
      </div>
    </div>

    <!-- Ставки -->
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 class="text-xl font-semibold text-white mb-6">Ставки ({{ bids.length }})</h2>
      
      <div v-if="bids.length === 0" class="text-center py-8">
        <p class="text-gray-400">Пока нет ставок</p>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="bid in bids" 
          :key="bid.id"
          class="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-xl font-bold text-white">
                {{ bid.carrier?.company_name?.charAt(0) || 'C' }}
              </div>
              <div>
                <h3 class="text-white font-semibold">{{ bid.carrier?.company_name }}</h3>
                <div class="flex items-center gap-2 text-gray-400 text-sm">
                  <span>★ {{ bid.carrier?.rating?.toFixed(1) || 'Нет отзывов' }}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-blue-400">{{ formatPrice(bid.price) }} {{ bid.currency || 'BYN' }}</p>
              <p class="text-gray-400 text-sm">{{ formatDate(bid.created_at) }}</p>
            </div>
          </div>
          <p v-if="bid.message" class="text-gray-300 mt-4">{{ bid.message }}</p>
        </div>
      </div>

      <!-- Форма ставки (для перевозчика) -->
      <div v-if="authStore.isCarrier && order.status === 'active'" class="mt-8 pt-8 border-t border-white/10">
        <h3 class="text-xl font-semibold text-white mb-4">Сделать ставку</h3>
        <form @submit.prevent="handlePlaceBid" class="space-y-4">
          <div>
            <label class="block text-gray-300 mb-2">Ваша цена</label>
            <input 
              v-model.number="bidForm.price"
              type="number" 
              required
              min="1"
              class="w-full md:w-1/2 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите сумму"
            />
          </div>
          <div>
            <label class="block text-gray-300 mb-2">Сообщение (опционально)</label>
            <textarea 
              v-model="bidForm.message"
              rows="3"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Дополнительная информация..."
            ></textarea>
          </div>
          
          <button 
            type="submit"
            :disabled="bidLoading"
            class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <span v-if="bidLoading">Отправка...</span>
            <span v-else>Предложить</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ordersAPI, bidsAPI } from '@/api/orders'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const order = ref(null)
const bids = ref([])
const bidForm = ref({ price: '', message: '' })
const bidLoading = ref(false)

const fetchOrder = async () => {
  try {
    const response = await ordersAPI.getById(route.params.id)
    order.value = response.data
  } catch (error) {
    console.error('Failed to fetch order:', error)
  }
}

const fetchBids = async () => {
  try {
    const response = await bidsAPI.getByOrderId(route.params.id)
    bids.value = response.data
  } catch (error) {
    console.error('Failed to fetch bids:', error)
  }
}

const handlePlaceBid = async () => {
  bidLoading.value = true
  
  try {
    await bidsAPI.create(route.params.id, bidForm.value)
    bidForm.value = { price: '', message: '' }
    await fetchBids()
  } catch (error) {
    console.error('Failed to place bid:', error)
  } finally {
    bidLoading.value = false
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
    container: 'Контейнер'
  }
  return typeMap[type] || type
}

const getLoadingTypeText = (type) => {
  const typeMap = {
    rear: 'Задняя',
    top: 'Верхняя',
    side: 'Боковая',
    hydrolift: 'Гидроборт'
  }
  return typeMap[type] || type
}

const formatPrice = (price) => {
  if (!price) return 'Договорная'
  return new Intl.NumberFormat('ru-RU').format(price)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU')
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchOrder(), fetchBids()])
  loading.value = false
})
</script>
