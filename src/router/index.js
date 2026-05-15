import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Landing.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPassword.vue'),
    },
    {
      path: '/pending',
      name: 'pending',
      component: () => import('../views/PendingApproval.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('../views/Landing.vue'),
    },
    // router/index.js (añadir después de las existentes)
    {
      path: '/super-admin',
      component: () => import('@/views/super-admin/SuperAdminLayout.vue'),
      meta: { requiresSuperAdmin: true },
      children: [
        { path: '', component: () => import('@/views/super-admin/Dashboard.vue') },
        { path: 'restaurantes', component: () => import('@/views/super-admin/Restaurantes.vue') },
        { path: 'solicitudes', component: () => import('@/views/super-admin/Solicitudes.vue') },
        { path: 'suscripciones', component: () => import('@/views/super-admin/Suscripciones.vue') },
        { path: 'reportes', component: () => import('@/views/super-admin/Reportes.vue') },
        { path: 'configuracion', component: () => import('@/views/super-admin/Configuracion.vue') },
      ],
    },
    // router/index.js
    {
      path: '/dashboard',
      component: () => import('@/views/restaurant/RestaurantLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', component: () => import('@/views/restaurant/Dashboard.vue') },
        { path: 'mesas', component: () => import('@/views/restaurant/Mesas.vue') },
        { path: 'menu', component: () => import('@/views/restaurant/Menu.vue') },
        { path: 'pedidos', component: () => import('@/views/restaurant/Pedidos.vue') },
        { path: 'empleados', component: () => import('@/views/restaurant/Empleados.vue') },
        { path: 'reportes', component: () => import('@/views/restaurant/Reportes.vue') },
        { path: 'configuracion', component: () => import('@/views/restaurant/Configuracion.vue') },
      ],
    },
    // router/index.js (añadir al final)

    // Rutas del menú cliente (sin login)
    {
      path: '/menu/:slug/:mesaId',
      component: () => import('@/views/client/ClientLayout.vue'),
      children: [
        {
          path: '',
          component: () => import('@/views/client/MenuView.vue'),
          name: 'client-menu',
        },
      ],
    },
    {
      path: '/info/:slug',
      component: () => import('@/views/client/ClientLayout.vue'),
      children: [
        {
          path: '',
          component: () => import('@/views/client/InfoView.vue'),
          name: 'client-info',
        },
      ],
    },
    {
      path: '/confirmacion/:slug/:mesaId',
      component: () => import('@/views/client/ClientLayout.vue'),
      children: [
        {
          path: '',
          component: () => import('@/views/client/ConfirmacionView.vue'),
          name: 'client-confirmacion',
        },
      ],
    },
  ],
})

import { useAuthStore } from '../stores/auth'

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresSuperAdmin = to.matched.some((record) => record.meta.requiresSuperAdmin)

  if (requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }

  if (requiresSuperAdmin && !authStore.isSuperAdmin) {
    return '/'
  }

  // Si va al dashboard y su rol es pending, redirigir a pending
  if (to.path.startsWith('/dashboard') && authStore.userRole === 'pending') {
    return '/pending'
  }
  
  // Si va a pending pero no es pending, redirigir al dashboard
  if (to.path === '/pending' && authStore.userRole !== 'pending' && authStore.isAuthenticated) {
    return '/dashboard'
  }
})

export default router
