<!-- src/views/PendingApproval.vue -->
<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="6" lg="5">
        <v-card class="pa-8 text-center" elevation="12" rounded="xl">
          <v-icon icon="mdi-clock-outline" size="80" color="warning" class="mb-4" />
          <div class="text-h4 font-weight-bold mb-4">Cuenta en Revisión</div>
          <div class="text-body-1 text-grey-darken-1 mb-6">
            ¡Gracias por registrarte en QRFeed! Hemos recibido tu solicitud de creación de restaurante.
            Para asegurar la mejor experiencia y seguridad, un administrador revisará tu información
            y se pondrá en contacto contigo muy pronto.
          </div>
          
          <v-divider class="mb-6" />
          
          <div class="text-body-2 text-grey mb-6">
            Si tienes dudas o necesitas acelerar el proceso, puedes contactarnos directamente:
          </div>
          
          <v-btn color="primary" variant="outlined" size="large" href="mailto:ventas@qrfeed.com" prepend-icon="mdi-email">
            Contactar a soporte
          </v-btn>
          
          <div class="mt-8">
            <v-btn variant="text" color="grey" @click="logout" prepend-icon="mdi-logout">
              Cerrar sesión
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>
