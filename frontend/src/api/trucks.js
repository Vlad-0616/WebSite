import apiClient from './client'

export const trucksAPI = {
  // Получить список доступного транспорта (публичный)
  getAll(params = {}) {
    return apiClient.get('/api/trucks', { params })
  },

  // Получить мой транспорт (только для перевозчиков)
  getMyTrucks() {
    return apiClient.get('/api/trucks/my')
  },

  // Получить детали транспорта
  getById(id) {
    return apiClient.get(`/api/trucks/${id}`)
  },

  // Добавить транспорт 
  create(data) {
    return apiClient.post('/api/trucks', data)
  },

  // Редактировать транспорт
  update(id, data) {
    return apiClient.patch(`/api/trucks/${id}`, data)
  },

  // Удалить транспорт
  delete(id) {
    return apiClient.delete(`/api/trucks/${id}`)
  },

  // Изменить статус доступности
  updateAvailability(id, available) {
    return apiClient.patch(`/api/trucks/${id}/availability`, { available })
  }
}

export default trucksAPI
