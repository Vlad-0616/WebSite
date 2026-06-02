<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-white mb-8">Создание заказа</h1>
    
    <div class="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-gray-300 mb-2">Адрес погрузки *</label>
            <input 
              v-model="form.pickup_address"
              type="text"
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="г. Минск, ул. Ленина, 1"
            />
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2">Адрес доставки *</label>
            <input 
              v-model="form.delivery_address"
              type="text"
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="г. Брест, ул. Машерова, 10"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-gray-300 mb-2">Вес (кг) *</label>
            <input 
              v-model.number="form.weight_kg"
              type="number"
              required
              min="1"
              step="100"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
            />
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2">Объём (м³)</label>
            <input 
              v-model.number="form.volume_m3"
              type="number"
              step="5"
              min="1"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="20"
            />
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2">Цена *</label>
            <input 
              v-model.number="form.price"
              type="number"
              required
              min="1"
              step="10"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="500"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-gray-300 mb-2">Тип кузова</label>
            <select 
              v-model="form.truck_type"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Не важно</option>
              <option value="refrigerator">Рефрижератор</option>
              <option value="tent">Тент</option>
              <option value="flatbed">Платформа</option>
              <option value="container">Контейнер</option>
              <option value="curtain">Штора</option>
              <option value="isothermal">Изотермический</option>
            </select>
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2">Тип погрузки</label>
            <select 
              v-model="form.loading_type"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Не важно</option>
              <option value="rear">Задняя</option>
              <option value="side">Боковая</option>
              <option value="top">Верхняя</option>
              <option value="hydrolift">Гидроборт</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-gray-300 mb-2">Дата погрузки</label>
          <input 
            v-model="form.loading_date"
            type="date"
            :min="minDate"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-gray-400 text-xs mt-1">Выберите сегодняшнюю или будущую дату</p>
        </div>

        <div>
          <label class="block text-gray-300 mb-2">Описание груза</label>
          <textarea 
            v-model="form.description"
            rows="4"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Дополнительная информация о грузе..."
          ></textarea>
        </div>

        <div v-if="error" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <div class="flex gap-4">
          <button 
            type="button"
            @click="$router.back()"
            class="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Отмена
          </button>
          <button 
            type="submit"
            :disabled="loading || !isFormValid"
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Создание...' : 'Создать заказ' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import apiClient from '@/api/client'

const router = useRouter()
const appStore = useAppStore()

const loading = ref(false)
const error = ref('')

// Минимальная дата - сегодня
const minDate = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const form = ref({
  pickup_address: '',
  delivery_address: '',
  weight_kg: null,
  volume_m3: null,
  truck_type: '',
  loading_type: '',
  price: null,
  loading_date: '',
  description: ''
})

// Проверка валидности формы
const isFormValid = computed(() => {
  // Проверка обязательных полей
  if (!form.value.pickup_address || !form.value.delivery_address || !form.value.weight_kg || !form.value.price) {
    return false
  }
  
  // Проверка даты (если указана)
  if (form.value.loading_date) {
    const selectedDate = new Date(form.value.loading_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      return false
    }
  }
  
  return true
})

const handleSubmit = async () => {
  // Дополнительная проверка даты перед отправкой
  if (form.value.loading_date) {
    const selectedDate = new Date(form.value.loading_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      error.value = 'Дата погрузки не может быть в прошлом. Выберите сегодняшнюю или будущую дату.'
      return
    }
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiClient.post('/api/orders', form.value)
    appStore.addNotification({ type: 'success', message: 'Заказ успешно создан' })
    
    setTimeout(() => {
      router.push(`/orders/${response.data.order.id}`)
    }, 500)
  } catch (err) {
    error.value = err.response?.data?.message || 'Ошибка при создании заказа'
  } finally {
    loading.value = false
  }
}
</script>
