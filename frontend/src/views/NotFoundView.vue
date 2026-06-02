<template>
  <div class="container mx-auto px-4 py-20 text-center">
    <div class="max-w-md mx-auto">
      <div class="text-9xl font-bold text-blue-500 mb-4">404</div>
      <h1 class="text-3xl font-bold text-white mb-4">Страница не найдена</h1>
      <p class="text-gray-400 mb-8">Извините, запрошенная страница не существует</p>
      <router-link 
        to="/"
        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors inline-block"
      >
        Вернуться на главную
      </router-link>
    </div>
  </div>
</template>