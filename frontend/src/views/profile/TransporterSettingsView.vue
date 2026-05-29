<template>
  <div class="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
    <h2 class="text-2xl font-bold text-white mb-6">Настройки профиля перевозчика</h2>
    
    <form @submit.prevent="updateSettings" class="space-y-6 max-w-2xl">
      <div>
        <label class="block text-gray-300 mb-2">Название компании</label>
        <input 
          v-model="form.company_name"
          type="text"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="ООО 'Грузоперевозки'"
        />
      </div>

      <div>
        <label class="block text-gray-300 mb-2">Описание компании</label>
        <textarea 
          v-model="form.company_description"
          rows="4"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Расскажите о вашей компании..."
        ></textarea>
      </div>

      <div>
        <label class="block text-gray-300 mb-2">Сайт</label>
        <input 
          v-model="form.website"
          type="url"
          class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com"
        />
      </div>

      <div v-if="successMessage" class="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
        {{ successMessage }}
      </div>
      
      <div v-if="errorMessage" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
        {{ errorMessage }}
      </div>

      <button 
        type="submit"
        :disabled="loading"
        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
      >
        {{ loading ? 'Сохранение...' : 'Сохранить настройки' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import apiClient from '@/api/client'

const appStore = useAppStore()
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = ref({
  company_name: '',
  company_description: '',
  website: ''
})

const updateSettings = async () => {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    await apiClient.patch('/api/auth/transporter-settings', form.value)
    successMessage.value = 'Настройки успешно сохранены'
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Ошибка при сохранении настроек'
  } finally {
    loading.value = false
  }
}
</script>
