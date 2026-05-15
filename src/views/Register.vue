<!-- src/views/Register.vue -->
<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="5" lg="4">
        <v-card class="pa-6" elevation="12" rounded="xl">
          <div class="text-center mb-6">
            <v-icon icon="mdi-qrcode-scan" size="48" color="primary" />
            <div class="text-h5 font-weight-bold mt-2">Crear Cuenta</div>
            <div class="text-body-2 text-grey">Únete a QRFeed y comienza tu prueba gratis</div>
          </div>

          <v-form @submit.prevent="handleRegister">
            <v-text-field
              v-model="name"
              label="Nombre del Restaurante"
              type="text"
              variant="outlined"
              prepend-inner-icon="mdi-store"
              density="comfortable"
              :rules="[rules.required]"
            />

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

            <v-btn type="submit" color="primary" size="large" block :loading="loading" class="mb-4 mt-2">
              Crear cuenta
            </v-btn>

            <v-alert v-if="errorMessage" type="error" variant="tonal" closable class="mb-4">
              {{ errorMessage }}
            </v-alert>

            <div class="text-center">
              <span class="text-body-2 text-grey">¿Ya tienes cuenta? </span>
              <v-btn variant="text" color="primary" to="/login" size="small">
                Iniciar sesión
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

const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const rules = {
  required: (v) => !!v || 'Este campo es requerido',
  email: (v) => /.+@.+\..+/.test(v) || 'Email inválido',
}

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value) return

  loading.value = true
  errorMessage.value = ''

  // Generar un slug a partir del nombre
  const slug = name.value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const restaurantData = {
    nombre: name.value,
    slug: slug
  }

  const result = await authStore.register(email.value, password.value, restaurantData)

  if (result.success) {
    loading.value = false
    router.push('/pending')
  } else {
    errorMessage.value = result.error || 'Ocurrió un error al registrar el restaurante'
    loading.value = false
  }
}
</script>
