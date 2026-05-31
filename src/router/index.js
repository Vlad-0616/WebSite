import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import OrdersListView from '../views/orders/OrdersListView.vue'

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
        component: () => import('../views/profile/MyOrdersView.vue')
      },
      {
        path: 'settings',
        name: 'profile-settings',
        component: () => import('../views/profile/SettingsView.vue')
      },
      {
        path: 'transporter/orders',
        name: 'transporter-orders',
        component: () => import('../views/profile/TransporterOrdersView.vue')
      },
      {
        path: 'transporter/trucks',
        name: 'transporter-trucks',
        component: () => import('../views/profile/TransporterTrucksView.vue')
      },
      {
        path: 'transporter/settings',
        name: 'transporter-settings',
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

// Упрощенный guard без асинхронного импорта
router.beforeEach((to, from) => {
  // Временно отключаем проверку аутентификации для теста
  return true
})

export default router
