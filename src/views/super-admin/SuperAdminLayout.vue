<!-- src/views/super-admin/SuperAdminLayout.vue -->
<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters>
      <!-- Sidebar Premium -->
      <v-navigation-drawer
        v-model="drawer"
        expand-on-hover
        rail
        width="280"
        color="grey-darken-4"
        theme="dark"
        permanent
        class="position-fixed"
      >
        <v-list>
          <v-list-item
            prepend-icon="mdi-qrcode-scan"
            title="QRFeed Admin"
            subtitle="Super Admin"
            class="mb-4"
          />

          <v-divider class="my-2" />

          <v-list-item
            v-for="item in menuItems"
            :key="item.title"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            :active="route.path === item.to"
            color="primary"
            rounded="lg"
            class="mb-1"
          />

          <v-divider class="my-2" />

          <v-list-item
            prepend-icon="mdi-logout"
            title="Cerrar sesión"
            @click="logout"
            color="error"
            rounded="lg"
          />
        </v-list>
      </v-navigation-drawer>

      <!-- Main Content -->
      <v-main class="bg-grey-lighten-4" style="margin-left: 64px">
        <v-container fluid class="pa-6">
          <!-- Header con breadcrumbs y usuario -->
          <v-row class="mb-6">
            <v-col cols="12">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <v-breadcrumbs :items="breadcrumbs" class="pa-0">
                    <template v-slot:title="{ item }">
                      <span class="text-h6 font-weight-medium">{{ item.title }}</span>
                    </template>
                  </v-breadcrumbs>
                </div>
                <div class="d-flex align-center">
                  <v-btn icon variant="text" color="grey">
                    <v-icon icon="mdi-bell-outline" />
                  </v-btn>
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn variant="text" v-bind="props" class="ml-2">
                        <v-avatar size="36" color="primary">
                          <v-icon icon="mdi-account" color="white" />
                        </v-avatar>
                        <span class="ml-2 text-body-2">{{ userEmail }}</span>
                        <v-icon icon="mdi-chevron-down" size="small" class="ml-1" />
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item to="/super-admin/profile">
                        <v-list-item-title>Mi perfil</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="logout">
                        <v-list-item-title class="text-error">Cerrar sesión</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Contenido dinámico -->
          <router-view />
        </v-container>
      </v-main>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const drawer = ref(true)
const userEmail = computed(() => authStore.user?.email)

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/super-admin' },
  { title: 'Restaurantes', icon: 'mdi-store', to: '/super-admin/restaurantes' },
  { title: 'Suscripciones', icon: 'mdi-credit-card', to: '/super-admin/suscripciones' },
  { title: 'Reportes', icon: 'mdi-chart-line', to: '/super-admin/reportes' },
  { title: 'Configuración', icon: 'mdi-cog', to: '/super-admin/configuracion' },
]

const breadcrumbs = computed(() => {
  const path = route.path.split('/').filter((p) => p)
  const items = [{ title: 'Inicio', to: '/super-admin' }]

  path.forEach((p, index) => {
    if (p !== 'super-admin') {
      items.push({
        title: p.charAt(0).toUpperCase() + p.slice(1),
        to: `/${path.slice(0, index + 1).join('/')}`,
      })
    }
  })
  return items
})

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.position-fixed {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
}
</style>
