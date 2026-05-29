<!-- frontend/src/views/profile/SettingsView.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-white mb-8">Настройки профиля</h1>
    
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Изменение профиля -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 class="text-xl font-bold text-white mb-4">Личные данные</h2>
        
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label class="block text-gray-300 mb-2">Имя</label>
            <input 
              v-model="profileForm.name"
              type="text"
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2">Телефон</label>
            <input 
              v-model="profileForm.phone"
              type="tel"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button 
            type="submit"
            :disabled="profileLoading"
            class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ profileLoading ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
        </form>
      </div>

      <!-- СМЕНА ПАРОЛЯ - ЗАКОММЕНТИРОВАНО -->
      <!-- <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 class="text-xl font-bold text-white mb-4">Смена пароля</h2>
        
        <form @submit.prevent="updatePassword" class="space-y-4">
          <div>
            <label class="block text-gray-300 mb-2">Текущий пароль</label>
            <input 
              v-model="passwordForm.current_password"
              type="password"
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2">Новый пароль</label>
            <input 
              v-model="passwordForm.new_password"
              type="password"
              required
              minlength="8"
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2">Подтвердите пароль</label>
            <input 
              v-model="passwordForm.confirm_password"
              type="password"
              required
              class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div v-if="passwordError" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
            {{ passwordError }}
          </div>
          
          <button 
            type="submit"
            :disabled="passwordLoading"
            class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ passwordLoading ? 'Смена...' : 'Сменить пароль' }}
          </button>
        </form>
      </div> -->

      <div v-if="successMessage" class="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
        {{ successMessage }}
      </div>
      
      <div v-if="errorMessage" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/client'

const authStore = useAuthStore()

const profileForm = ref({
  name: '',
  phone: ''
})

// Смена пароля - закомментирована
// const passwordForm = ref({
//   current_password: '',
//   new_password: '',
//   confirm_password: ''
// })

const profileLoading = ref(false)
// const passwordLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const updateProfile = async () => {
  profileLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    await apiClient.patch('/api/auth/profile', profileForm.value)
    await authStore.fetchUser()
    successMessage.value = 'Профиль успешно обновлён'
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Ошибка при обновлении профиля'
  } finally {
    profileLoading.value = false
  }
}

// Функция смены пароля - закомментирована
// const updatePassword = async () => {
//   if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
//     errorMessage.value = 'Новые пароли не совпадают'
//     return
//   }
//   
//   if (passwordForm.value.new_password.length < 8) {
//     errorMessage.value = 'Пароль должен быть не менее 8 символов'
//     return
//   }
//   
//   passwordLoading.value = true
//   successMessage.value = ''
//   errorMessage.value = ''
//   
//   try {
//     await apiClient.post('/api/auth/change-password', {
//       current_password: passwordForm.value.current_password,
//       new_password: passwordForm.value.new_password
//     })
//     
//     successMessage.value = 'Пароль успешно изменён'
//     passwordForm.value = {
//       current_password: '',
//       new_password: '',
//       confirm_password: ''
//     }
//     
//     setTimeout(() => { successMessage.value = '' }, 3000)
//   } catch (error) {
//     errorMessage.value = error.response?.data?.message || 'Ошибка при смене пароля'
//   } finally {
//     passwordLoading.value = false
//   }
// }

onMounted(() => {
  if (authStore.user) {
    profileForm.value.name = authStore.user.name || ''
    profileForm.value.phone = authStore.user.phone || ''
  }
})
</script>