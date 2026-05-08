<!-- src/App.vue -->
<template>
  <v-app>
    <!-- App Bar Premium -->
    <v-app-bar color="primary" elevation="0" prominent>
      <v-container class="d-flex align-center justify-space-between">
        <!-- Logo -->
        <div class="d-flex align-center">
          <v-icon color="white" size="36" class="mr-3" icon="mdi-qrcode-scan" />
          <div>
            <span class="text-h5 font-weight-bold text-white">QRFeed</span>
            <span class="text-caption text-white opacity-70 ml-2">by IB.com</span>
          </div>
        </div>

        <!-- Navigation -->
        <div class="d-flex align-center">
          <template v-if="!isLoggedIn">
            <v-btn variant="text" color="white" to="/"> Inicio </v-btn>
            <v-btn variant="text" color="white" to="/pricing"> Precios </v-btn>
            <v-btn variant="outlined" color="white" to="/login" class="ml-2">
              Iniciar sesión
            </v-btn>
            <v-btn color="secondary" to="/register" class="ml-2"> Probar gratis </v-btn>
          </template>

          <template v-else>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn color="white" variant="text" v-bind="props">
                  <v-avatar size="32" class="mr-2">
                    <v-icon icon="mdi-account-circle" />
                  </v-avatar>
                  {{ userEmail }}
                  <v-icon icon="mdi-chevron-down" size="small" class="ml-1" />
                </v-btn>
              </template>
              <v-list>
                <v-list-item to="/dashboard">
                  <v-list-item-title>
                    <v-icon icon="mdi-view-dashboard" size="small" class="mr-2" />
                    Dashboard
                  </v-list-item-title>
                </v-list-item>
                <v-list-item to="/profile">
                  <v-list-item-title>
                    <v-icon icon="mdi-account" size="small" class="mr-2" />
                    Mi perfil
                  </v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item @click="logout">
                  <v-list-item-title class="text-error">
                    <v-icon icon="mdi-logout" size="small" class="mr-2" />
                    Cerrar sesión
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </div>
      </v-container>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-0">
        <router-view />
      </v-container>
    </v-main>

    <!-- Footer Premium -->
    <v-footer color="grey-darken-3" dark padless>
      <v-row justify="center" no-gutters class="pa-6">
        <v-col cols="12" md="3" class="text-center text-md-left">
          <v-icon icon="mdi-qrcode-scan" size="28" class="mb-2" />
          <div class="text-h6 font-weight-bold">QRFeed</div>
          <div class="text-caption opacity-70">Menú digital premium para restaurantes</div>
        </v-col>

        <v-col cols="6" md="2">
          <div class="text-subtitle-2 font-weight-bold mb-3">Producto</div>
          <div class="text-caption py-1">Características</div>
          <div class="text-caption py-1">Precios</div>
          <div class="text-caption py-1">Demo</div>
        </v-col>

        <v-col cols="6" md="2">
          <div class="text-subtitle-2 font-weight-bold mb-3">Empresa</div>
          <div class="text-caption py-1">IB.com</div>
          <div class="text-caption py-1">Contacto</div>
        </v-col>

        <v-col cols="12" class="text-center mt-6">
          <v-divider class="mb-4 opacity-25" />
          <div class="text-caption opacity-50">
            &copy; {{ new Date().getFullYear() }} IB.com - Todos los derechos reservados
          </div>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isAuthenticated)
const userEmail = computed(() => authStore.user?.email)

const logout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.opacity-70 {
  opacity: 0.7;
}
.opacity-50 {
  opacity: 0.5;
}
.opacity-25 {
  opacity: 0.25;
}
</style>
