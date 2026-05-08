<!-- src/views/Login.vue -->
<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="5" lg="4">
        <v-card class="pa-6" elevation="12" rounded="xl">
          <div class="text-center mb-6">
            <v-icon icon="mdi-qrcode-scan" size="48" color="primary" />
            <div class="text-h5 font-weight-bold mt-2">Bienvenido</div>
            <div class="text-body-2 text-grey">Ingresa a tu cuenta de QRFeed</div>
          </div>

          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              density="comfortable"
              :rules="[rules.required, rules.email]"
            />

            <v-text-field
              v-model="password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              density="comfortable"
              :rules="[rules.required]"
            />

            <div class="d-flex justify-space-between align-center mb-4">
              <v-checkbox v-model="rememberMe" label="Recordarme" density="compact" hide-details />
              <v-btn variant="text" color="primary" size="small" to="/forgot-password">
                ¿Olvidaste tu contraseña?
              </v-btn>
            </div>

            <v-btn type="submit" color="primary" size="large" block :loading="loading" class="mb-4">
              Iniciar sesión
            </v-btn>

            <v-alert v-if="errorMessage" type="error" variant="tonal" closable class="mb-4">
              {{ errorMessage }}
            </v-alert>

            <div class="text-center">
              <span class="text-body-2 text-grey">¿No tienes cuenta? </span>
              <v-btn variant="text" color="primary" to="/register" size="small">
                Crear cuenta gratis
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const rules = {
  required: (v) => !!v || 'Este campo es requerido',
  email: (v) => /.+@.+\..+/.test(v) || 'Email inválido',
}

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    // Redirigir según rol
    if (authStore.isSuperAdmin) {
      router.push('/super-admin')
    } else if (authStore.isRestaurantAdmin) {
      router.push('/dashboard')
    } else {
      router.push('/dashboard/mesero')
    }
  } else {
    errorMessage.value = 'Email o contraseña incorrectos'
  }

  loading.value = false
}
</script>
