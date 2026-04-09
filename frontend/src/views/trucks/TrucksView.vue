<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-white mb-8">Каталог транспорта</h1>
    
    <!-- Фильтры -->
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-gray-300 mb-2">Тип транспорта</label>
          <select 
            v-model="filters.truck_type"
            @change="fetchTrucks"
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
          <label class="block text-gray-300 mb-2">Мин. грузоподъёмность (кг)</label>
          <input 
            v-model.number="filters.capacity_min"
            @change="fetchTrucks"
            type="number" 
            placeholder="1000"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-gray-300 mb-2">Местоположение</label>
          <input 
            v-model="filters.location"
            @input="debounceSearch"
            type="text" 
            placeholder="Город"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Список транспорта -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 animate-pulse">
        <div class="h-6 bg-white/20 rounded mb-4 w-3/4"></div>
        <div class="h-4 bg-white/10 rounded mb-2"></div>
        <div class="h-4 bg-white/10 rounded mb-4"></div>
      </div>
    </div>

    <div v-else-if="trucks.length === 0" class="text-center py-16 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
      <p class="text-gray-400 text-lg">Нет доступного транспорта</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="truck in trucks" 
        :key="truck.id"
        class="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
      >
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-xl font-semibold text-white">
            {{ getTruckTypeText(truck.truck_type) }}
          </h3>
          <span 
            :class="[
              'px-3 py-1 rounded-full text-xs font-semibold',
              truck.available ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
            ]"
          >
            {{ truck.available ? 'Доступен' : 'Недоступен' }}
          </span>
        </div>
        
        <div class="text-gray-300 text-sm space-y-2 mb-4">
          <div class="flex justify-between">
            <span>Грузоподъёмность:</span>
            <span class="font-semibold">{{ truck.capacity_kg }} кг</span>
          </div>
          <div v-if="truck.capacity_m3" class="flex justify-between">
            <span>Объём:</span>
            <span class="font-semibold">{{ truck.capacity_m3 }} м³</span>
          </div>
          <div v-if="truck.plate_number" class="flex justify-between">
            <span>Госномер:</span>
            <span class="font-semibold">{{ truck.plate_number }}</span>
          </div>
          <div v-if="truck.location" class="flex justify-between">
            <span>Местоположение:</span>
            <span class="font-semibold">{{ truck.location }}</span>
          </div>
        </div>
        
        <div class="text-gray-400 text-sm">
          Перевозчик: {{ truck.carrier?.company_name || 'Частное лицо' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/api/client'

const loading = ref(true)
const trucks = ref([])
const filters = ref({
  truck_type: '',
  capacity_min: null,
  location: ''
})

let searchTimeout = null

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchTrucks()
  }, 500)
}

const fetchTrucks = async () => {
  loading.value = true
  
  try {
    const params = {}
    if (filters.value.truck_type) params.truck_type = filters.value.truck_type
    if (filters.value.capacity_min) params.capacity_min = filters.value.capacity_min
    if (filters.value.location) params.location = filters.value.location
    
    const response = await apiClient.get('/api/trucks', { params })
    trucks.value = response.data
  } catch (error) {
    console.error('Failed to fetch trucks:', error)
  } finally {
    loading.value = false
  }
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

onMounted(() => {
  fetchTrucks()
})
</script>
