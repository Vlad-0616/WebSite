<template>
  <DefaultLayout>
    <router-view />
  </DefaultLayout>

  <div class="fixed top-20 right-4 z-50 space-y-2">
    <div
      v-for="notification in appStore.notifications"
      :key="notification.id"
      :class="[
        'px-4 py-3 rounded-lg shadow-lg text-white min-w-[300px] animate-slide-in',
        {
          'bg-green-500': notification.type === 'success',
          'bg-red-500': notification.type === 'error',
          'bg-blue-500': notification.type === 'info',
          'bg-yellow-500': notification.type === 'warning'
        }
      ]"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import DefaultLayout from './layouts/DefaultLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const authStore = useAuthStore()
const appStore = useAppStore()

onMounted(async () => {
  if (authStore.accessToken) {
    await authStore.fetchUser()
  }
})
</script>

<style>
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>
