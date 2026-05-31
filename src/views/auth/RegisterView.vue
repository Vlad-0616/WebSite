<template>
  <!-- Контейнер страницы регистрации: центрирование формы по вертикали и горизонтали -->
  <div class="min-h-screen flex items-center justify-center px-4 py-20">
    <!-- Карточка формы с полупрозрачным фоном и размытием -->
    <div class="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h1 class="text-3xl font-bold text-white text-center mb-8">Регистрация</h1>
      <div class="mb-6">
        <label class="block text-gray-300 mb-3">Выберите роль</label>
        <div class="grid grid-cols-2 gap-3">
          <!-- Кнопка «Заказчик» -->
          <button
            type="button"
            @click="form.role = 'shipper'"
            :class="[
              'px-4 py-3 rounded-lg font-semibold transition-colors border',
              form.role === 'shipper'
                ? 'bg-blue-500 border-blue-400 text-white'
                : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
            ]"
          >
            Заказчик
          </button>
          <!-- Кнопка «Перевозчик» -->
          <button
            type="button"
            @click="form.role = 'carrier'"
            :class="[
              'px-4 py-3 rounded-lg font-semibold transition-colors border',
              form.role === 'carrier'
                ? 'bg-blue-500 border-blue-400 text-white'
                : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
            ]"
          >
            Перевозчик
          </button>
        </div>
      </div>


      <!-- Форма регистрации -->
      <form @submit.prevent="handleRegister" autocomplete="off" class="space-y-4">
        <div>
          <label class="block text-gray-300 mb-2">Имя</label>
          <input
            v-model="form.name"
            type="text"
            required
            autocomplete="off"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Иван Иванов"
          />
        </div>

        <div>
          <label class="block text-gray-300 mb-2">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            autocomplete="off"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="example@mail.com"
          />
        </div>

        <div>
          <label class="block text-gray-300 mb-2">Телефон</label>
          <input
            v-model="form.phone"
            type="tel"
            required
            autocomplete="off"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+375 (29) 123-45-67"
          />
        </div>

        <div>
          <label class="block text-gray-300 mb-2">Пароль</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="8"
            maxlength="16"
            autocomplete="new-password"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Минимум 8 символов"
          />
        </div>

        <div>
          <label class="block text-gray-300 mb-2">Подтвердите пароль</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Повторите пароль"
          />
        </div>

        <!-- Индикатор требований к пароля -->
        <div class="bg-white/5 rounded-lg p-4 text-sm space-y-2">
          <p class="text-gray-400 font-semibold mb-2">Требования к паролю:</p>
          <p :class="passwordChecks.length ? 'text-green-400' : 'text-gray-400'">
            {{ passwordChecks.length ? '✓' : '○' }} От 8 до 16 символов
          </p>
          <p :class="passwordChecks.uppercase ? 'text-green-400' : 'text-gray-400'">
            {{ passwordChecks.uppercase ? '✓' : '○' }} Заглавная буква
          </p>
          <p :class="passwordChecks.lowercase ? 'text-green-400' : 'text-gray-400'">
            {{ passwordChecks.lowercase ? '✓' : '○' }} Строчная буква
          </p>
          <p :class="passwordChecks.special ? 'text-green-400' : 'text-gray-400'">
            {{ passwordChecks.special ? '✓' : '○' }} Специальный символ
          </p>
          <p :class="passwordChecks.match ? 'text-green-400' : 'text-gray-400'">
            {{ passwordChecks.match ? '✓' : '○' }} Пароли совпадают
          </p>
        </div>

        <!-- Сообщение об ошибке регистрации -->
        <div v-if="error" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

<div class="space-y-4 border-t border-white/10 pt-4 mt-4">
  <h3 class="text-white font-semibold text-sm">Данные для восстановления доступа</h3>
  
  <div>
    <label class="block text-gray-300 mb-2 text-sm">Подсказка к кодовому слову (например: "Девичья фамилия матери")</label>
    <input
      v-model="form.hintQuestion"
      type="text"
      required
      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Введите наводящий вопрос"
    />
  </div>

  <div>
    <label class="block text-gray-300 mb-2 text-sm">Кодовое слово (ответ)</label>
    <input
      v-model="form.secretWord"
      type="text"
      required
      class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Введите секретное слово"
    />
  </div>
</div>

        <!-- Кнопка отправки формы -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          <span v-if="loading">Регистрация...</span>
          <span v-else>Зарегистрироваться</span>
        </button>
      </form>
      <!-- Ссылка на страницу входа -->
      <div class="mt-6 text-center">
        <p class="text-gray-300 text-sm">
          Уже есть аккаунт?
          <router-link to="/auth/login" class="text-blue-400 hover:text-blue-300">
            Войти
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

//Объект формы с данными регистрации
const form = ref({
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'shipper',
  name: '',
  secretWord: '',  
  hintQuestion: ''
})

//Вычисляемое свойство для проверки требований к паролю
const passwordChecks = computed(() => {
  const password = form.value.password
  const confirm = form.value.confirmPassword
  return {
    length: password.length >= 8 && password.length <= 16,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    match: password === confirm && confirm !== ''
  }
})

//Состояние загрузки (блокировка кнопки во время отправки)
const loading = ref(false)

//Текст ошибки для отображения пользователю.
const error = ref('')

//Обработчик отправки формы регистрации.
const handleRegister = async () => {
  loading.value = true
  error.value = ''
//Вызываем authStore.register() с данными формы.
  const result = await authStore.register(form.value)

  loading.value = false
//При успехе перенапрвляем на главную, при ошибке вывод сообщения.
  if (result.success) {
    await authStore.fetchUser()
    form.value = { email: '', phone: '', password: '', confirmPassword: '', role: 'shipper', name: '' }
    router.push('/')
  } else {
    error.value = result.error
  }
}
</script>
