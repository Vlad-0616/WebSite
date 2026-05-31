import apiClient from './client'

export const ordersAPI = {
  
  // Получить список заказов с фильтрацией
  getAll(params = {}) {
    return apiClient.get('/api/orders', { params })
  },

  // Получить детали заказа по ID
  getById(id) {
    return apiClient.get(`/api/orders/${id}`)
  },

  // Создать новый заказ
  create(data) {
    return apiClient.post('/api/orders', data)
  },

  // Обновить заказ
  update(id, data) {
    return apiClient.patch(`/api/orders/${id}`, data)
  },

  // Отменить заказ (удалить)
  delete(id) {
    return apiClient.delete(`/api/orders/${id}`)
  },
  
  // Получить мои заказы (для заказчика)
  getMyOrders() {
    return apiClient.get('/api/orders/my')
  },

  // Назначить перевозчика на заказ
  assignCarrier(orderId, data) {
    return apiClient.post(`/api/orders/${orderId}/assign-carrier`, data)
  },
  
  // Получить доступные для перевозчика заказы (исключая свои)
  getAvailableOrders() {
    return apiClient.get('/api/orders/available')
  },

  // Принять заказ (перевозчик)
  acceptOrder(orderId) {
    return apiClient.post(`/api/orders/${orderId}/accept`)
  },

  // Получить мои активные заказы (в работе для перевозчика)
  getMyActiveOrders() {
    return apiClient.get('/api/orders/my-active')
  },
  
  // Отменить назначение (вернуть заказ в активные)
  cancelAssignment(orderId) {
    return apiClient.post(`/api/orders/${orderId}/cancel-assignment`)
  },

  // Подтвердить доставку
  confirmDelivery(orderId) {
    return apiClient.post(`/api/orders/${orderId}/confirm-delivery`)
  }
}

export const bidsAPI = {
  // Получить ставки по заказу
  getByOrderId(orderId, params = {}) {
    return apiClient.get(`/api/orders/${orderId}/bids`, { params })
  },

  // Сделать ставку на заказ
  create(orderId, data) {
    return apiClient.post(`/api/orders/${orderId}/bids`, data)
  },

  // Отозвать ставку
  withdraw(bidId) {
    return apiClient.delete(`/api/bids/${bidId}`)
  },

  // Получить мои ставки (для перевозчика)
  getMyBids(params = {}) {
    return apiClient.get('/api/bids/my', { params })
  }
}

export default ordersAPI
