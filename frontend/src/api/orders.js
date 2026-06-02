import apiClient from './client'

export const ordersAPI = {
  getAll(params = {}) {
    return apiClient.get('/api/orders', { params })
  },

  getById(id) {
    return apiClient.get(`/api/orders/${id}`)
  },

  create(data) {
    return apiClient.post('/api/orders', data)
  },

  update(id, data) {
    return apiClient.patch(`/api/orders/${id}`, data)
  },

  delete(id) {
    return apiClient.delete(`/api/orders/${id}`)
  },
  
  getMyOrders() {
    return apiClient.get('/api/orders/my')
  },

  getMyActiveOrders() {
    return apiClient.get('/api/orders/my-active')
  },
  
  acceptOrder(orderId) {
    return apiClient.post(`/api/orders/${orderId}/accept`)
  },
  
  cancelAssignment(orderId) {
    return apiClient.post(`/api/orders/${orderId}/cancel-assignment`)
  }
}

export const bidsAPI = {
  getByOrderId(orderId, params = {}) {
    return apiClient.get(`/api/orders/${orderId}/bids`, { params })
  },

  create(orderId, data) {
    return apiClient.post(`/api/orders/${orderId}/bids`, data)
  },

  withdraw(bidId) {
    return apiClient.delete(`/api/bids/${bidId}`)
  },

  getMyBids(params = {}) {
    return apiClient.get('/api/bids/my', { params })
  }
}

export default ordersAPI
