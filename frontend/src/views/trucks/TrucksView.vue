<template>
  <div class="container mx-auto px-4 py-6 md:py-8">
    <h1 class="text-2xl md:text-4xl font-bold text-white mb-6 md:mb-8">Каталог транспорта</h1>
    
    <!-- Простые фильтры -->
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20 mb-6 md:mb-8">
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-gray-300 mb-2 text-sm md:text-base">Местоположение</label>
          <input 
            v-model="filters.location"
            @input="debounceSearch"
            type="text" 
            placeholder="Минск, Брест..."
            class="w-full px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          />
        </div>
        <div>
          <label class="block text-gray-300 mb-2 text-sm md:text-base">Тип транспорта</label>
          <select 
            v-model="filters.truck_type"
            @change="fetchTrucks"
            class="w-full px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
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
        <button 
          @click="resetFilters"
          class="w-full bg-white/10 hover:bg-white/20 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition-colors border border-white/20 text-sm md:text-base"
        >
          Сбросить фильтры
        </button>
      </div>
    </div>

    <!-- Расширенные фильтры -->
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20 mb-6 md:mb-8">
      <button 
        @click="showFilters = !showFilters"
        class="flex items-center justify-between w-full text-white font-semibold text-sm md:text-base"
      >
        <span>Расширенные фильтры</span>
        <svg 
          class="w-4 h-4 md:w-5 md:h-5 transition-transform"
          :class="{ 'rotate-180': showFilters }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div v-show="showFilters" class="mt-4 md:mt-6">
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <label class="block text-gray-300 mb-2 text-sm md:text-base">Грузоподъёмность от (кг)</label>
              <input 
                v-model.number="filters.capacity_min"
                @change="fetchTrucks"
                type="number" 
                placeholder="1000"
                class="w-full px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
            </div>
            <div>
              <label class="block text-gray-300 mb-2 text-sm md:text-base">Грузоподъёмность до (кг)</label>
              <input 
                v-model.number="filters.capacity_max"
                @change="fetchTrucks"
                type="number" 
                placeholder="20000"
                class="w-full px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <label class="block text-gray-300 mb-2 text-sm md:text-base">Объём от (м³)</label>
              <input 
                v-model.number="filters.volume_min"
                @change="fetchTrucks"
                type="number" 
                step="10"
                placeholder="20"
                class="w-full px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
            </div>
            <div>
              <label class="block text-gray-300 mb-2 text-sm md:text-base">Объём до (м³)</label>
              <input 
                v-model.number="filters.volume_max"
                @change="fetchTrucks"
                type="number" 
                step="10"
                placeholder="120"
                class="w-full px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Активные фильтры -->
    <div v-if="activeFiltersCount > 0" class="flex flex-wrap gap-2 mb-4 md:mb-6">
      <span class="text-gray-300 text-xs md:text-sm">Активные фильтры:</span>
      <span 
        v-for="filter in activeFiltersList" 
        :key="filter.key"
        class="inline-flex items-center gap-1 px-2 py-1 md:px-3 md:py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs md:text-sm"
      >
        {{ filter.label }}
        <button @click="removeFilter(filter.key)" class="hover:text-white">×</button>
      </span>
      <button @click="resetFilters" class="text-red-400 hover:text-red-300 text-xs md:text-sm ml-2">
        Сбросить всё
      </button>
    </div>

    <!-- Список транспорта -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <div v-for="i in 6" :key="i" class="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20 animate-pulse">
        <div class="h-5 md:h-6 bg-white/20 rounded mb-3 md:mb-4 w-3/4"></div>
        <div class="h-3 md:h-4 bg-white/10 rounded mb-2"></div>
        <div class="h-3 md:h-4 bg-white/10 rounded mb-3 md:mb-4"></div>
        <div class="h-6 md:h-8 bg-white/20 rounded w-1/2"></div>
      </div>
    </div>

    <div v-else-if="trucks.length === 0" class="text-center py-12 md:py-16 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
      <svg class="w-16 h-16 md:w-20 md:h-20 text-gray-500 mx-auto mb-3 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M5 10v11h14V10" />
      </svg>
      <p class="text-gray-400 text-base md:text-lg">Нет транспорта, соответствующего фильтрам</p>
      <button 
        @click="resetFilters"
        class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 md:px-6 md:py-3 rounded-lg transition-colors text-sm md:text-base"
      >
        Сбросить фильтры
      </button>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
      <div 
        v-for="truck in trucks" 
        :key="truck.id"
        class="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20 hover:bg-white/15 transition-colors"
      >
        <div class="flex items-start justify-between mb-3 md:mb-4">
          <h3 class="text-base md:text-xl font-semibold text-white">
            {{ getTruckTypeText(truck.truck_type) }}
          </h3>
          <span 
            :class="[
              'px-2 py-1 rounded-full text-xs font-semibold',
              truck.available ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
            ]"
          >
            {{ truck.available ? 'Доступен' : 'Недоступен' }}
          </span>
        </div>
        
        <div class="text-gray-300 text-xs md:text-sm space-y-1 md:space-y-2 mb-3 md:mb-4">
          <div class="flex justify-between">
            <span>Грузоподъёмность:</span>
            <span class="font-semibold">{{ formatNumber(truck.capacity_kg) }} кг</span>
          </div>
          <div v-if="truck.capacity_m3" class="flex justify-between">
            <span>Объём:</span>
            <span class="font-semibold">{{ formatNumber(truck.capacity_m3) }} м³</span>
          </div>
          <div v-if="truck.plate_number" class="flex justify-between">
            <span>Госномер:</span>
            <span class="font-mono font-semibold text-xs md:text-sm">{{ truck.plate_number }}</span>
          </div>
          <div v-if="truck.brand || truck.model" class="flex justify-between">
            <span>Модель:</span>
            <span class="font-semibold text-xs md:text-sm">{{ truck.brand }} {{ truck.model }}</span>
          </div>
          <div v-if="truck.year" class="flex justify-between">
            <span>Год выпуска:</span>
            <span class="font-semibold text-xs md:text-sm">{{ truck.year }}</span>
          </div>
          <div v-if="truck.location" class="flex justify-between">
            <span>Местоположение:</span>
            <span class="font-semibold text-xs md:text-sm">{{ truck.location }}</span>
          </div>
        </div>
        
        <div class="border-t border-white/10 pt-2 md:pt-3 mt-2">
          <div class="flex items-center gap-2 text-gray-400 text-xs md:text-sm">
            <svg class="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Перевозчик: {{ truck.carrier?.company_name || truck.carrier?.name || 'Частное лицо' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/api/client'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const trucks = ref([])
const showFilters = ref(false)

const filters = ref({
  location: route.query.location || '',
  truck_type: route.query.truck_type || '',
  capacity_min: route.query.capacity_min ? Number(route.query.capacity_min) : null,
  capacity_max: route.query.capacity_max ? Number(route.query.capacity_max) : null,
  volume_min: route.query.volume_min ? Number(route.query.volume_min) : null,
  volume_max: route.query.volume_max ? Number(route.query.volume_max) : null
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.location) count++
  if (filters.value.truck_type) count++
  if (filters.value.capacity_min) count++
  if (filters.value.capacity_max) count++
  if (filters.value.volume_min) count++
  if (filters.value.volume_max) count++
  return count
})

const activeFiltersList = computed(() => {
  const list = []
  if (filters.value.location) list.push({ key: 'location', label: `${filters.value.location}` })
  if (filters.value.truck_type) list.push({ key: 'truck_type', label: `Тип: ${getTruckTypeText(filters.value.truck_type)}` })
  if (filters.value.capacity_min) list.push({ key: 'capacity_min', label: `Грузоподъёмность от: ${filters.value.capacity_min} кг` })
  if (filters.value.capacity_max) list.push({ key: 'capacity_max', label: `Грузоподъёмность до: ${filters.value.capacity_max} кг` })
  if (filters.value.volume_min) list.push({ key: 'volume_min', label: `Объём от: ${filters.value.volume_min} м³` })
  if (filters.value.volume_max) list.push({ key: 'volume_max', label: `Объём до: ${filters.value.volume_max} м³` })
  return list
})

let searchTimeout = null

const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchTrucks()
  }, 500)
}

const removeFilter = (key) => {
  filters.value[key] = ''
  fetchTrucks()
}

const fetchTrucks = async () => {
  loading.value = true
  
  try {
    const params = {}
    
    if (filters.value.location) params.location = filters.value.location
    if (filters.value.truck_type) params.truck_type = filters.value.truck_type
    if (filters.value.capacity_min) params.capacity_min = filters.value.capacity_min
    if (filters.value.capacity_max) params.capacity_max = filters.value.capacity_max
    if (filters.value.volume_min) params.volume_min = filters.value.volume_min
    if (filters.value.volume_max) params.volume_max = filters.value.volume_max
    
    const response = await apiClient.get('/api/trucks', { params })
    trucks.value = response.data || []
    
    const queryParams = {}
    Object.keys(filters.value).forEach(key => {
      const val = filters.value[key]
      if (val && val !== '') {
        queryParams[key] = val
      }
    })
    router.replace({ query: queryParams })
    
  } catch (error) {
    console.error('Ошибка загрузки:', error)
    trucks.value = []
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    location: '',
    truck_type: '',
    capacity_min: null,
    capacity_max: null,
    volume_min: null,
    volume_max: null
  }
  fetchTrucks()
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

onMounted(() => {
  fetchTrucks()
})
</script>
