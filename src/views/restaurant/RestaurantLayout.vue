<!-- src/views/restaurant/RestaurantLayout.vue -->
<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters>
      <!-- Sidebar -->
      <v-navigation-drawer
        v-model="drawer"
        expand-on-hover
        rail
        width="280"
        color="white"
        permanent
        class="position-fixed"
        elevation="2"
      >
        <v-list>
          <v-list-item
            prepend-icon="mdi-qrcode-scan"
            :title="restaurantNombre"
            :subtitle="restaurantPlan"
            class="mb-4"
          />

          <v-divider class="my-2" />

          <v-list-item
            v-for="item in menuItems"
            :key="item.title"
            :to="`/dashboard/${item.to}`"
            :prepend-icon="item.icon"
            :title="item.title"
            :active="route.path.includes(item.to)"
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
      <v-main style="margin-left: 64px">
        <v-container fluid class="pa-6">
          <!-- Header -->
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
                  <!-- Alerta de vencimiento -->
                  <v-chip
                    v-if="diasRestantes <= 7"
                    :color="diasRestantes <= 0 ? 'error' : 'warning'"
                    variant="tonal"
                    class="mr-3"
                  >
                    <v-icon
                      :icon="diasRestantes <= 0 ? 'mdi-alert-circle' : 'mdi-clock-alert'"
                      size="small"
                      class="mr-1"
                    />
                    {{
                      diasRestantes <= 0 ? 'Suscripción vencida' : `${diasRestantes} días restantes`
                    }}
                  </v-chip>

                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn variant="text" v-bind="props">
                        <v-avatar size="36" color="primary">
                          <v-icon icon="mdi-account" color="white" />
                        </v-avatar>
                        <span class="ml-2 text-body-2">{{ userEmail }}</span>
                        <v-icon icon="mdi-chevron-down" size="small" class="ml-1" />
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item to="/dashboard/perfil">
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

    <!-- Dialog de renovación -->
    <v-dialog v-model="renewalDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon icon="mdi-credit-card" class="mr-2" color="warning" />
          Suscripción por vencer
        </v-card-title>
        <v-card-text>
          Tu suscripción vence en {{ diasRestantes }} días. <br /><br />
          Para continuar usando QRFeed, contacta a soporte para renovar:
          <br />
          <strong>soporte@ib.com</strong> o +56 9 1234 5678
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="renewalDialog = false">Entendido</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const drawer = ref(true)
const renewalDialog = ref(false)
const restaurantData = ref({})

const userEmail = computed(() => authStore.user?.email)
const restaurantNombre = computed(() => restaurantData.value.nombre || 'Cargando...')
const restaurantPlan = computed(() => {
  const plans = { basico: 'Plan Básico', pro: 'Plan Pro', premium: 'Plan Premium' }
  return plans[restaurantData.value.plan] || ''
})

const diasRestantes = computed(() => {
  if (!restaurantData.value.fechaVencimiento) return 0
  const hoy = new Date()
  const vence = restaurantData.value.fechaVencimiento.toDate()
  const diff = Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24))
  return diff
})

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '' },
  { title: 'Mesas', icon: 'mdi-table-furniture', to: 'mesas' },
  { title: 'Menú', icon: 'mdi-food', to: 'menu' },
  { title: 'Pedidos', icon: 'mdi-clipboard-list', to: 'pedidos' },
  { title: 'Empleados', icon: 'mdi-account-group', to: 'empleados' },
  { title: 'Reportes', icon: 'mdi-chart-line', to: 'reportes' },
  { title: 'Configuración', icon: 'mdi-cog', to: 'configuracion' },
]

const breadcrumbs = computed(() => {
  const path = route.path.split('/').filter((p) => p && p !== 'dashboard')
  const items = [{ title: 'Dashboard', to: '/dashboard', disabled: path.length === 0 }]

  path.forEach((p, index) => {
    items.push({
      title: p.charAt(0).toUpperCase() + p.slice(1),
      to: `/dashboard/${path.slice(0, index + 1).join('/')}`,
      disabled: index === path.length - 1,
    })
  })
  return items
})

const loadRestaurantData = async () => {
  if (authStore.tenantId) {
    const restDoc = await getDoc(doc(db, 'tenants', authStore.tenantId))
    if (restDoc.exists()) {
      restaurantData.value = { id: restDoc.id, ...restDoc.data() }

      // Mostrar dialog si está por vencer
      if (diasRestantes.value <= 7 && diasRestantes.value > 0) {
        renewalDialog.value = true
      }
    }
  }
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadRestaurantData()
})
</script>

<style scoped>
.position-fixed {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
}
</style>
