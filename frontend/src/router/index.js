import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import OrdersListView from '../views/orders/OrdersListView.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('../views/auth/LoginView.vue'),
        meta: { guest: true }
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('../views/auth/RegisterView.vue'),
        meta: { guest: true }
      },
      {
        path: 'recover',
        name: 'recover',
        component: () => import('../views/auth/RecoverView.vue'),
        meta: { guest: true }
      }
    ]
  },
  {
    path: '/orders',
    children: [
      {
        path: '',
        name: 'orders',
        component: OrdersListView
      },
      {
        path: 'create',
        name: 'create-order',
        meta: { requiresAuth: true },
        component: () => import('../views/orders/CreateOrderView.vue')
      },
      {
        path: ':id',
        name: 'order-detail',
        component: () => import('../views/orders/OrderDetailView.vue')
      }
    ]
  },
  {
    path: '/trucks',
    name: 'trucks',
    component: () => import('../views/trucks/TrucksView.vue')
  },
  {
    path: '/profile',
    meta: { requiresAuth: true },
    component: () => import('../views/profile/ProfileView.vue'),
    children: [
      {
        path: 'my-orders',
        name: 'my-orders',
        meta: { requiresAuth: true },
        component: () => import('../views/profile/MyOrdersView.vue')
      },
      {
        path: 'settings',
        name: 'profile-settings',
        meta: { requiresAuth: true },
        component: () => import('../views/profile/SettingsView.vue')
      },
      {
        path: 'transporter/orders',
        name: 'transporter-orders',
        meta: { requiresAuth: true, role: 'carrier' },
        component: () => import('../views/profile/TransporterOrdersView.vue')
      },
      {
        path: 'transporter/trucks',
        name: 'transporter-trucks',
        meta: { requiresAuth: true, role: 'carrier' },
        component: () => import('../views/profile/TransporterTrucksView.vue')
      },
      {
        path: 'transporter/settings',
        name: 'transporter-settings',
        meta: { requiresAuth: true, role: 'carrier' },
        component: () => import('../views/profile/TransporterSettingsView.vue')
      }
    ]
  },
  {
    path: '/admin',
    name: 'admin',
    meta: { requiresAuth: true, requiresAdmin: true },
    component: () => import('../views/admin/AdminView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Защита маршрутов
router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()
  
  if (!authStore.user && authStore.accessToken) {
    await authStore.fetchUser()
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const requiredRole = to.matched.find(record => record.meta.role)?.meta?.role
  const isGuestOnly = to.matched.some(record => record.meta.guest)
  
  if (isGuestOnly && authStore.isAuthenticated) {
    return '/'
  }
  
  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  
  if (requiresAdmin && !authStore.isAdmin) {
    return '/'
  }
  
  if (requiredRole && requiredRole === 'carrier' && !authStore.isCarrier) {
    return '/profile'
  }
})

export default router
