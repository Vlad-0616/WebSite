<!-- frontend/src/views/profile/TransporterTrucksView.vue -->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-white">Мой транспорт</h2>
      <button 
        @click="openAddModal"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Добавить транспорт
      </button>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 animate-pulse">
        <div class="h-6 bg-white/20 rounded w-1/4 mb-4"></div>
        <div class="h-4 bg-white/10 rounded w-1/3"></div>
      </div>
    </div>

    <div v-else-if="trucks.length === 0" class="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
      <svg class="w-20 h-20 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M5 10v11h14V10" />
      </svg>
      <p class="text-gray-400 text-lg mb-4">У вас пока нет добавленного транспорта</p>
      <button 
        @click="openAddModal"
        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Добавить первый транспорт
      </button>
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div 
        v-for="truck in trucks" 
        :key="truck.id"
        class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
      >
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3 flex-wrap">
              <span class="text-3xl">{{ getTruckIcon(truck.truck_type) }}</span>
              <h3 class="text-xl font-semibold text-white">{{ getTruckTypeText(truck.truck_type) }}</h3>
              <span 
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  truck.available ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                ]"
              >
                {{ truck.available ? 'Доступен' : 'Недоступен' }}
              </span>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-gray-400 text-xs">Грузоподъёмность</p>
                <p class="text-white font-medium">{{ truck.capacity_kg }} кг</p>
              </div>
              <div v-if="truck.capacity_m3">
                <p class="text-gray-400 text-xs">Объём</p>
                <p class="text-white font-medium">{{ truck.capacity_m3 }} м³</p>
              </div>
              <div v-if="truck.plate_number">
                <p class="text-gray-400 text-xs">Госномер</p>
                <p class="text-white font-mono">{{ truck.plate_number }}</p>
              </div>
              <div v-if="truck.brand || truck.model">
                <p class="text-gray-400 text-xs">Модель</p>
                <p class="text-white">{{ truck.brand }} {{ truck.model }}</p>
              </div>
              <div v-if="truck.year">
                <p class="text-gray-400 text-xs">Год выпуска</p>
                <p class="text-white">{{ truck.year }}</p>
              </div>
              <div v-if="truck.location">
                <p class="text-gray-400 text-xs">Местоположение</p>
                <p class="text-white">{{ truck.location }}</p>
              </div>
            </div>
            
            <p v-if="truck.description" class="text-gray-300 text-sm mt-3 bg-white/5 p-2 rounded">
              {{ truck.description }}
            </p>
          </div>
          
          <div class="flex gap-2">
            <button 
              @click="toggleAvailability(truck)"
              :class="[
                'px-3 py-2 rounded-lg transition-colors text-sm font-medium',
                truck.available 
                  ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' 
                  : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
              ]"
              :title="truck.available ? 'Сделать недоступным' : 'Сделать доступным'"
            >
              {{ truck.available ? 'Снять с линии' : 'Вернуть в работу' }}
            </button>
            <button 
              @click="openEditModal(truck)"
              class="p-2 text-blue-400 hover:text-blue-300 transition-colors"
              title="Редактировать"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              @click="confirmDelete(truck)"
              class="p-2 text-red-400 hover:text-red-300 transition-colors"
              title="Удалить"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно (остаётся без изменений) -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeModal">
      <!-- ... содержимое модального окна остаётся как было ... -->
      <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-br from-slate-800 to-slate-900 p-6 border-b border-white/10">
          <div class="flex justify-between items-center">
            <h3 class="text-2xl font-bold text-white">{{ editingTruck ? 'Редактировать транспорт' : 'Добавить транспорт' }}</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form @submit.prevent="saveTruck" class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-300 mb-2">Тип транспорта *</label>
              <select 
                v-model="form.truck_type"
                required
                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Выберите тип</option>
                <option value="refrigerator">❄️ Рефрижератор</option>
                <option value="tent">🚛 Тент</option>
                <option value="flatbed">📦 Платформа</option>
                <option value="container">📦 Контейнеровоз</option>
                <option value="curtain">🚚 Штора</option>
                <option value="isothermal">🌡️ Изотермический</option>
              </select>
            </div>
            
            <div>
              <label class="block text-gray-300 mb-2">Грузоподъёмность (кг) *</label>
              <input 
                v-model.number="form.capacity_kg"
                type="number" 
                required
                min="1"
                step="100"
                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="20000"
              />
            </div>
            
            <div>
              <label class="block text-gray-300 mb-2">Госномер *</label>
              <input 
                v-model="form.plate_number"
                type="text"
                required
                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="АА 1234-7"
              />
            </div>
            
            <div>
              <label class="block text-gray-300 mb-2">Марка</label>
              <input 
                v-model="form.brand"
                type="text"
                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Volvo"
              />
            </div>
            
            <div>
              <label class="block text-gray-300 mb-2">Модель</label>
              <input 
                v-model="form.model"
                type="text"
                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="FH16"
              />
            </div>
            
            <div>
              <label class="block text-gray-300 mb-2">Год выпуска</label>
              <input 
                v-model.number="form.year"
                type="number"
                min="1950"
                :max="new Date().getFullYear()"
                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2020"
              />
            </div>
            
            <div>
              <label class="block text-gray-300 mb-2">Объём (м³)</label>
              <input 
                v-model.number="form.capacity_m3"
                type="number"
                step="5"
                min="1"
                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="82"
              />
            </div>
            
            <div>
              <label class="block text-gray-300 mb-2">Местоположение</label>
              <input 
                v-model="form.location"
                type="text"
                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Минск"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2">Габариты (Д×Ш×В, м)</label>
            <input 
              v-model="form.dimensions"
              type="text"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="13.6×2.45×2.45"
            />
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2">Описание</label>
            <textarea 
              v-model="form.description"
              rows="3"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Дополнительная информация о транспорте..."
            ></textarea>
          </div>
          
          <div v-if="submitError" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
            {{ submitError }}
          </div>
          
          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="closeModal"
              class="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
            <button 
              type="submit"
              :disabled="submitting"
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {{ submitting ? 'Сохранение...' : (editingTruck ? 'Сохранить' : 'Добавить') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { trucksAPI } from '@/api/trucks'

const appStore = useAppStore()

const loading = ref(true)
const trucks = ref([])
const showModal = ref(false)
const editingTruck = ref(null)
const submitting = ref(false)
const submitError = ref('')

const form = ref({
  truck_type: '',
  brand: '',
  model: '',
  year: null,
  plate_number: '',
  capacity_kg: null,
  capacity_m3: null,
  dimensions: '',
  location: '',
  description: ''
})

const fetchTrucks = async () => {
  loading.value = true
  try {
    const response = await trucksAPI.getMyTrucks()
    trucks.value = response.data
  } catch (error) {
    console.error('Failed to fetch trucks:', error)
    appStore.setError('Не удалось загрузить список транспорта')
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  editingTruck.value = null
  form.value = {
    truck_type: '',
    brand: '',
    model: '',
    year: null,
    plate_number: '',
    capacity_kg: null,
    capacity_m3: null,
    dimensions: '',
    location: '',
    description: ''
  }
  showModal.value = true
}

const openEditModal = (truck) => {
  editingTruck.value = truck
  form.value = {
    truck_type: truck.truck_type,
    brand: truck.brand || '',
    model: truck.model || '',
    year: truck.year || null,
    plate_number: truck.plate_number || '',
    capacity_kg: truck.capacity_kg,
    capacity_m3: truck.capacity_m3 || null,
    dimensions: truck.dimensions || '',
    location: truck.location || '',
    description: truck.description || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTruck.value = null
  submitError.value = ''
}

const saveTruck = async () => {
  submitting.value = true
  submitError.value = ''
  
  try {
    const data = {
      truck_type_id: form.value.truck_type,
      brand: form.value.brand || null,
      model: form.value.model || null,
      year: form.value.year || null,
      plate_number: form.value.plate_number || null,
      capacity_kg: form.value.capacity_kg,
      capacity_m3: form.value.capacity_m3 || null,
      dimensions: form.value.dimensions || null,
      location: form.value.location || null,
      description: form.value.description || null
    }
    
    if (editingTruck.value) {
      await trucksAPI.update(editingTruck.value.id, data)
      appStore.addNotification({ type: 'success', message: 'Транспорт успешно обновлён' })
    } else {
      await trucksAPI.create(data)
      appStore.addNotification({ type: 'success', message: 'Транспорт успешно добавлен' })
    }
    
    closeModal()
    await fetchTrucks()
  } catch (error) {
    console.error('Failed to save truck:', error)
    submitError.value = error.response?.data?.message || 'Ошибка при сохранении'
  } finally {
    submitting.value = false
  }
}

const toggleAvailability = async (truck) => {
  try {
    await trucksAPI.updateAvailability(truck.id, !truck.available)
    await fetchTrucks()
    appStore.addNotification({ 
      type: 'success', 
      message: truck.available ? 'Транспорт снят с линии' : 'Транспорт снова в работе' 
    })
  } catch (error) {
    console.error('Failed to toggle availability:', error)
    appStore.setError('Не удалось изменить статус')
  }
}

const confirmDelete = (truck) => {
  if (confirm(`Вы уверены, что хотите удалить ${getTruckTypeText(truck.truck_type)}?`)) {
    deleteTruck(truck.id)
  }
}

const deleteTruck = async (id) => {
  try {
    await trucksAPI.delete(id)
    await fetchTrucks()
    appStore.addNotification({ type: 'success', message: 'Транспорт удалён' })
  } catch (error) {
    console.error('Failed to delete truck:', error)
    appStore.setError('Не удалось удалить транспорт')
  }
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

const getTruckIcon = (type) => {
  const iconMap = {
    refrigerator: '❄️',
    tent: '🚛',
    flatbed: '📦',
    container: '📦',
    curtain: '🚚',
    isothermal: '🌡️'
  }
  return iconMap[type] || '🚛'
}

onMounted(() => {
  fetchTrucks()
})
</script>
