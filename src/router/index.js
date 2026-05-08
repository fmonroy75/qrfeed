import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    // router/index.js (añadir después de las existentes)
    {
      path: '/super-admin',
      component: () => import('@/views/super-admin/SuperAdminLayout.vue'),
      meta: { requiresSuperAdmin: true },
      children: [
        { path: '', component: () => import('@/views/super-admin/Dashboard.vue') },
        { path: 'restaurantes', component: () => import('@/views/super-admin/Restaurantes.vue') },
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

export default router
