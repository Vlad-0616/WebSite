<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/10">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <router-link to="/" class="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
          Перевозки.Бел
        </router-link>
        
        <nav class="flex items-center gap-6">
          <router-link 
            to="/orders" 
            class="text-white hover:text-blue-400 transition-colors"
          >
            Заказы
          </router-link>
          <router-link 
            to="/trucks" 
            class="text-white hover:text-blue-400 transition-colors"
          >
            Транспорт
          </router-link>
          
          <template v-if="authStore.isAuthenticated">
            <router-link 
              to="/favorites" 
              class="text-white hover:text-blue-400 transition-colors"
            >
              Избранное
            </router-link>
            
            <div class="relative group">
              <button class="text-white hover:text-blue-400 transition-colors flex items-center gap-2">
                <span>{{ authStore.user?.company_name || 'Профиль' }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div class="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-lg rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <router-link 
                  :to="authStore.isCarrier ? '/profile/transporter/bids' : '/profile'"
                  class="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                >
                  Личный кабинет
                </router-link>
                <router-link 
                  v-if="authStore.isAdmin"
                  to="/admin"
                  class="block px-4 py-2 text-gray-800 hover:bg-blue-50"
                >
                  Админ-панель
                </router-link>
                <button 
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-50"
                >
                  Выйти
                </button>
              </div>
            </div>
          </template>
          
          <template v-else>
            <router-link 
              to="/auth/login" 
              class="text-white hover:text-blue-400 transition-colors"
            >
              Войти
            </router-link>
            <router-link 
              to="/auth/register" 
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Регистрация
            </router-link>
          </template>
        </nav>
      </div>
    </header>

    <main class="pt-20">
      <slot />
    </main>

    <footer class="bg-white/5 border-t border-white/10 py-8 mt-16">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-xl font-bold text-blue-400 mb-4">Перевозки.Бел</h3>
            <p class="text-gray-300 text-sm">
              Биржа грузоперевозок для прямого взаимодействия грузовладельцев и перевозчиков
            </p>
          </div>
          
          <div>
            <h4 class="font-semibold text-white mb-4">Навигация</h4>
            <ul class="space-y-2">
              <li><router-link to="/orders" class="text-gray-300 hover:text-blue-400">Заказы</router-link></li>
              <li><router-link to="/trucks" class="text-gray-300 hover:text-blue-400">Транспорт</router-link></li>
              <li v-if="!authStore.isAuthenticated"><router-link to="/auth/register" class="text-gray-300 hover:text-blue-400">Регистрация</router-link></li>
            </ul>
          </div>
          
          <div>
            <h4 class="font-semibold text-white mb-4">Контакты</h4>
            <ul class="space-y-2 text-gray-300 text-sm">
              <li>Email: perevozki.bel@gmail.com</li>
              <li>Тел: +375 (29) 228-04-38</li>
              <li>Брест, Беларусь</li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-white/10 mt-8 pt-8 text-center text-gray-400 text-sm">
          © {{ new Date().getFullYear() }} Перевозки.Бел. Все права защищены.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>
