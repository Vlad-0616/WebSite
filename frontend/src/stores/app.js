import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const loading = ref(false)
  const error = ref(null)
  const notifications = ref([])

  function setLoading(value) {
    loading.value = value
  }

  function setError(message) {
    error.value = message
    setTimeout(() => {
      error.value = null
    }, 5000)
  }

  function addNotification(notification) {
    const id = Date.now()
    notifications.value.push({
      id,
      type: notification.type || 'info',
      message: notification.message,
      duration: notification.duration || 3000
    })
    
    setTimeout(() => {
      removeNotification(id)
    }, notification.duration || 3000)
  }

  function removeNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  return {
    loading,
    error,
    notifications,
    setLoading,
    setError,
    addNotification,
    removeNotification
  }
})
