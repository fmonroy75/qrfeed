<!-- src/views/super-admin/Configuracion.vue -->
<template>
  <div>
    <v-row class="mb-6" align="center">
      <v-col cols="12" sm="8">
        <div class="d-flex align-center">
          <v-avatar color="primary-lighten-4" class="mr-4" size="56">
            <v-icon icon="mdi-cog" color="primary" size="32" />
          </v-avatar>
          <div>
            <div class="text-h4 font-weight-bold">Ajustes Globales</div>
            <div class="text-body-1 text-grey-darken-1">Configuración central de la plataforma QRFeed</div>
          </div>
        </div>
      </v-col>
      <v-col cols="12" sm="4" class="text-sm-right">
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-content-save"
          :loading="saving"
          @click="saveSettings"
          elevation="2"
        >
          Guardar Cambios
        </v-btn>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="3" class="overflow-hidden">
      <v-tabs
        v-model="activeTab"
        bg-color="grey-lighten-4"
        color="primary"
        align-tabs="center"
        slider-color="primary"
        class="border-b"
      >
        <v-tab value="general" class="text-none font-weight-medium">
          <v-icon start icon="mdi-tune" /> General
        </v-tab>
        <v-tab value="security" class="text-none font-weight-medium">
          <v-icon start icon="mdi-shield-lock" /> Seguridad
        </v-tab>
        <v-tab value="payments" class="text-none font-weight-medium">
          <v-icon start icon="mdi-credit-card" /> Pagos
        </v-tab>
        <v-tab value="smtp" class="text-none font-weight-medium">
          <v-icon start icon="mdi-email" /> Servidor de Correo
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab" class="bg-white">
        <!-- Pestaña General -->
        <v-window-item value="general" class="pa-8">
          <v-row>
            <v-col cols="12" md="6">
              <div class="text-subtitle-1 font-weight-bold mb-4">Información de la Plataforma</div>
              <v-text-field
                v-model="settings.general.platformName"
                label="Nombre de la Plataforma"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-format-title"
              />
              <v-text-field
                v-model="settings.general.contactEmail"
                label="Correo de Contacto"
                type="email"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-email-outline"
              />
              <v-text-field
                v-model="settings.general.supportPhone"
                label="Teléfono de Soporte"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-phone-outline"
              />
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-1 font-weight-bold mb-4">Localización por Defecto</div>
              <v-select
                v-model="settings.general.defaultCurrency"
                :items="['USD', 'EUR', 'MXN', 'COP', 'CLP']"
                label="Moneda Principal"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-currency-usd"
              />
              <v-select
                v-model="settings.general.timezone"
                :items="['America/Mexico_City', 'America/Bogota', 'America/Santiago', 'Europe/Madrid', 'UTC']"
                label="Zona Horaria Base"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-clock-outline"
              />
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Pestaña Seguridad -->
        <v-window-item value="security" class="pa-8">
          <v-row>
            <v-col cols="12" md="8">
              <v-card variant="outlined" class="mb-4 pa-4 border-error" :class="{'bg-error-lighten-5': settings.security.maintenanceMode}">
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="text-h6 font-weight-bold text-error">Modo Mantenimiento</div>
                    <div class="text-body-2 text-grey-darken-1">Apaga el acceso al sistema para todos los restaurantes y clientes. Útil para actualizaciones críticas.</div>
                  </div>
                  <v-switch
                    v-model="settings.security.maintenanceMode"
                    color="error"
                    hide-details
                    inset
                  />
                </div>
              </v-card>

              <v-card variant="outlined" class="pa-4">
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="text-h6 font-weight-bold">Permitir Nuevos Registros</div>
                    <div class="text-body-2 text-grey-darken-1">Habilita o deshabilita la creación de nuevas cuentas de restaurantes.</div>
                  </div>
                  <v-switch
                    v-model="settings.security.allowNewRegistrations"
                    color="success"
                    hide-details
                    inset
                  />
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-alert type="info" variant="tonal" border="start" class="mb-4">
                <div class="font-weight-bold mb-1">Nota sobre Seguridad</div>
                Los cambios en esta pestaña tienen efecto inmediato en toda la plataforma. Úsalos con precaución.
              </v-alert>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Pestaña Pagos -->
        <v-window-item value="payments" class="pa-8">
          <v-row>
            <v-col cols="12" md="6">
              <div class="text-subtitle-1 font-weight-bold mb-4">Comisiones y Pruebas</div>
              <v-text-field
                v-model="settings.payments.platformFeePercent"
                label="Comisión de Plataforma (%)"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-percent"
                hint="Porcentaje de cobro sobre transacciones"
                persistent-hint
                class="mb-4"
              />
              <v-text-field
                v-model="settings.payments.freeTrialDays"
                label="Días de Prueba Gratis"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar-range"
              />
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-1 font-weight-bold mb-4">Credenciales API de Pago</div>
              <v-text-field
                v-model="settings.payments.stripePublicKey"
                label="Stripe Public Key"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-key-outline"
              />
              <v-text-field
                v-model="settings.payments.stripeSecretKey"
                label="Stripe Secret Key"
                type="password"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-key-chain"
              />
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Pestaña SMTP -->
        <v-window-item value="smtp" class="pa-8">
          <v-row>
            <v-col cols="12" md="6">
              <div class="text-subtitle-1 font-weight-bold mb-4">Servidor SMTP Principal</div>
              <v-text-field
                v-model="settings.smtp.host"
                label="SMTP Host (Ej: smtp.mailgun.org)"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-server-network"
              />
              <v-text-field
                v-model="settings.smtp.port"
                label="SMTP Port"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lan-connect"
              />
              <v-text-field
                v-model="settings.smtp.fromEmail"
                label="Email de Remitente (De:)"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-email-fast"
              />
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-subtitle-1 font-weight-bold mb-4">Autenticación SMTP</div>
              <v-text-field
                v-model="settings.smtp.username"
                label="SMTP Username"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account"
              />
              <v-text-field
                v-model="settings.smtp.password"
                label="SMTP Password"
                type="password"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock"
              />
              <v-btn variant="outlined" color="secondary" block prepend-icon="mdi-email-check" class="mt-2">
                Enviar correo de prueba
              </v-btn>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Snackbar de Éxito -->
    <v-snackbar v-model="snackbar" color="success" timeout="3000" location="top right">
      <v-icon start icon="mdi-check-circle" />
      Ajustes guardados correctamente.
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const activeTab = ref('general')
const saving = ref(false)
const snackbar = ref(false)

// Estado simulado de los ajustes
const settings = reactive({
  general: {
    platformName: 'QRFeed',
    contactEmail: 'hola@qrfeed.com',
    supportPhone: '+1 800 123 4567',
    defaultCurrency: 'USD',
    timezone: 'America/Mexico_City',
  },
  security: {
    maintenanceMode: false,
    allowNewRegistrations: true,
  },
  payments: {
    platformFeePercent: 2.5,
    freeTrialDays: 14,
    stripePublicKey: 'pk_test_1234567890',
    stripeSecretKey: 'sk_test_1234567890',
  },
  smtp: {
    host: 'smtp.mailgun.org',
    port: 587,
    username: 'postmaster@sandbox.mailgun.org',
    password: 'secure_password_123',
    fromEmail: 'no-reply@qrfeed.com',
  }
})

const saveSettings = () => {
  saving.value = true
  
  // Simular llamada a la API
  setTimeout(() => {
    saving.value = false
    snackbar.value = true
  }, 1200)
}
</script>

<style scoped>
/* Estilos para el borde cuando el modo mantenimiento está activo */
.border-error {
  border: 1px solid rgb(var(--v-theme-error)) !important;
}
.bg-error-lighten-5 {
  background-color: #ffebee !important;
}
</style>
