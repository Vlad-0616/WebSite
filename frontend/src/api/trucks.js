import apiClient from './client'

export const trucksAPI = {
  // Получить список транспорта
  getAll(params = {}) {
    return apiClient.get('/api/trucks', { params })
  },

  // Получить мой транспорт
  getMyTrucks() {
    return apiClient.get('/api/trucks', { params: { carrier_id: 'me' } })
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

export const truckTypesAPI = {
  // Получить справочник типов транспорта
  getAll() {
    return apiClient.get('/api/truck-types')
  }
}

export default trucksAPI
