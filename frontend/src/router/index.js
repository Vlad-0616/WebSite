import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
        component: () => import('../views/auth/LoginView.vue')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('../views/auth/RegisterView.vue')
      },
      {
        path: 'recover',
        name: 'recover',
        component: () => import('../views/auth/RecoverView.vue')
      }
    ]
  },
  {
    path: '/orders',
    children: [
      {
        path: '',
        name: 'orders',
        component: () => import('../views/orders/OrdersListView.vue')
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
    children: [
      {
        path: '',
        name: 'profile',
        component: () => import('../views/profile/ProfileView.vue')
      },
      {
        path: 'transporter',
        children: [
          {
            path: 'bids',
            name: 'transporter-bids',
            component: () => import('../views/profile/TransporterBidsView.vue')
          },
          {
            path: 'orders',
            name: 'transporter-orders',
            component: () => import('../views/profile/TransporterOrdersView.vue')
          },
          {
            path: 'trucks',
            name: 'transporter-trucks',
            component: () => import('../views/profile/TransporterTrucksView.vue')
          },
          {
            path: 'settings',
            name: 'transporter-settings',
            component: () => import('../views/profile/TransporterSettingsView.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/favorites',
    name: 'favorites',
    meta: { requiresAuth: true },
    component: () => import('../views/favorites/FavoritesView.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    meta: { requiresAuth: true, requiresAdmin: true },
    component: () => import('../views/admin/AdminView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach(async (to, from) => {
  // Динамический импорт чтобы избежать ошибки при инициализации
  const { useAuthStore } = await import('../stores/auth')
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'home' }
  }
  // Возвращаем true для продолжения навигации
  return true
})

export default router
