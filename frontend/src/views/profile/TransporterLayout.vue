<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-white mb-8">Личный кабинет перевозчика</h1>
    
    <!-- Навигация -->
    <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-8">
      <nav class="flex gap-4 flex-wrap">
        <router-link 
          to="/profile/transporter/bids"
          class="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          Мои ставки
        </router-link>
        <router-link 
          to="/profile/transporter/orders"
          class="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          Мои заказы
        </router-link>
        <router-link 
          to="/profile/transporter/trucks"
          class="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          Управление транспортом
        </router-link>
        <router-link 
          to="/profile/transporter/settings"
          class="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          Настройки
        </router-link>
      </nav>
    </div>

    <!-- Контент -->
    <router-view />
  </div>
</template>
