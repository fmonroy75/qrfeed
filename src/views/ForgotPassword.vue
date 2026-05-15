<!-- src/views/ForgotPassword.vue -->
<template>
  <v-container class="fill-height bg-grey-lighten-4" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="pa-8 text-center" elevation="4" rounded="xl">
          <div class="mb-6">
            <v-icon icon="mdi-lock-reset" size="64" color="primary" class="mb-4" />
            <div class="text-h4 font-weight-bold mb-2">Recuperar Contraseña</div>
            <div class="text-body-1 text-grey-darken-1 px-4">
              Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
            </div>
          </div>

          <v-form @submit.prevent="handleResetPassword" v-if="!emailSent">
            <v-text-field
              v-model="email"
              label="Correo Electrónico"
              type="email"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              density="comfortable"
              class="mb-2"
              :rules="[rules.required, rules.email]"
            />

            <v-btn
              type="submit"
              color="primary"
              size="x-large"
              block
              :loading="loading"
              class="mb-6 mt-4 text-none font-weight-bold"
              elevation="2"
            >
              Enviar instrucciones
            </v-btn>

            <v-alert v-if="errorMessage" type="error" variant="tonal" closable class="mb-4 text-left">
              {{ errorMessage }}
            </v-alert>

            <div>
              <v-btn variant="text" color="primary" to="/login" class="text-none">
                <v-icon icon="mdi-arrow-left" start />
                Volver a Iniciar Sesión
              </v-btn>
            </div>
          </v-form>

          <div v-else class="py-4">
            <v-alert type="success" variant="tonal" class="mb-6 text-left">
              Si existe una cuenta con ese correo, hemos enviado un enlace para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada o carpeta de spam.
            </v-alert>
            <v-btn color="primary" size="large" to="/login" block class="text-none font-weight-bold" elevation="2">
              Volver a Iniciar Sesión
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const loading = ref(false)
const errorMessage = ref('')
const emailSent = ref(false)

const rules = {
  required: (v) => !!v || 'Este campo es requerido',
  email: (v) => /.+@.+\..+/.test(v) || 'Email inválido',
}

const handleResetPassword = async () => {
  if (!email.value || !rules.email(email.value)) return
  
  loading.value = true
  errorMessage.value = ''

  // Simulate API call
  setTimeout(() => {
    loading.value = false
    emailSent.value = true
  }, 1500)
}
</script>
