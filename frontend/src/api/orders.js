import apiClient from './client'

export const ordersAPI = {
  // Получить список заказов с фильтрацией
  getAll(params = {}) {
    return apiClient.get('/api/orders', { params })
  },

  // Получить персонализированную ленту
  getFeed(limit = 20) {
    return apiClient.get('/api/orders/feed', { params: { limit } })
  },

  // Получить детали заказа
  getById(id) {
    return apiClient.get(`/api/orders/${id}`)
  },

  // Создать новый заказ
  create(orderData) {
    return apiClient.post('/api/orders', orderData)
  },

  // Редактировать заказ
  update(id, data) {
    return apiClient.patch(`/api/orders/${id}`, data)
  },

  // Отменить заказ
  cancel(id) {
    return apiClient.delete(`/api/orders/${id}`)
  },

  // Назначить перевозчика (принять ставку)
  assignCarrier(orderId, bidId) {
    return apiClient.post(`/api/orders/${orderId}/assign`, { bid_id: bidId })
  },

  // Подтвердить доставку
  confirmDelivery(id) {
    return apiClient.post(`/api/orders/${id}/confirm-delivery`)
  }
}

export const bidsAPI = {
  // Получить ставки по заказу
  getByOrderId(orderId, params = {}) {
    return apiClient.get(`/api/orders/${orderId}/bids`, { params })
  },

  // Сделать ставку
  create(orderId, data) {
    return apiClient.post(`/api/orders/${orderId}/bids`, data)
  },

  // Отозвать ставку
  withdraw(bidId) {
    return apiClient.delete(`/api/bids/${bidId}`)
  },

  // Получить мои ставки
  getMyBids(params = {}) {
    return apiClient.get('/api/bids', { params })
  }
}

export default ordersAPI
