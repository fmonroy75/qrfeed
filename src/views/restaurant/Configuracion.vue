<!-- src/views/restaurant/Configuracion.vue -->
<template>
  <div>
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <span class="text-h5 font-weight-bold">Configuración</span>
            <span class="text-caption text-grey ml-2">Personaliza tu restaurante</span>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-content-save"
            @click="saveAllSettings"
            :loading="saving"
          >
            Guardar cambios
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Tabs de configuración -->
    <v-card rounded="xl" elevation="2">
      <v-tabs v-model="activeTab" color="primary" align-tabs="center">
        <v-tab value="general">
          <v-icon icon="mdi-store" class="mr-1" size="small" />
          General
        </v-tab>
        <v-tab value="branding">
          <v-icon icon="mdi-palette" class="mr-1" size="small" />
          Branding
        </v-tab>
        <v-tab value="horarios">
          <v-icon icon="mdi-clock" class="mr-1" size="small" />
          Horarios
        </v-tab>
        <v-tab value="integraciones">
          <v-icon icon="mdi-api" class="mr-1" size="small" />
          Integraciones
        </v-tab>
        <v-tab value="facturacion">
          <v-icon icon="mdi-credit-card" class="mr-1" size="small" />
          Facturación
        </v-tab>
      </v-tabs>

      <v-divider />

      <v-card-text class="pa-6">
        <!-- Tab General -->
        <div v-show="activeTab === 'general'">
          <v-form ref="generalForm" v-model="generalValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.nombre"
                  label="Nombre del restaurante"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.slug"
                  label="URL única (slug)"
                  :rules="[rules.required, rules.slug]"
                  variant="outlined"
                  density="comfortable"
                  hint="qrfeed.ib.com/rest/mi-restaurante"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.email"
                  label="Email de contacto"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="settings.telefono"
                  label="Teléfono"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="settings.direccion"
                  label="Dirección"
                  rows="2"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="settings.descripcion"
                  label="Descripción del restaurante"
                  rows="3"
                  variant="outlined"
                  density="comfortable"
                  hint="Breve descripción que verán tus clientes"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.tipoCocina"
                  :items="tiposCocina"
                  label="Tipo de cocina"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.moneda"
                  :items="monedas"
                  label="Moneda"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>
          </v-form>
        </div>

        <!-- Tab Branding -->
        <div v-show="activeTab === 'branding'">
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="xl" class="pa-4">
                <div class="text-subtitle-1 font-weight-bold mb-4">Logo</div>
                <div class="d-flex justify-center mb-4">
                  <v-avatar size="120" rounded="lg" :color="settings.colorPrimario" class="border">
                    <v-img v-if="settings.logo" :src="settings.logo" />
                    <v-icon v-else icon="mdi-store" size="48" color="white" />
                  </v-avatar>
                </div>
                <v-text-field
                  v-model="settings.logo"
                  label="URL del logo"
                  variant="outlined"
                  density="comfortable"
                  hint="Pega una URL de imagen"
                />
                <v-btn variant="tonal" color="primary" block @click="uploadLogo" class="mt-2">
                  <v-icon icon="mdi-upload" class="mr-1" />
                  Subir logo
                </v-btn>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="xl" class="pa-4">
                <div class="text-subtitle-1 font-weight-bold mb-4">Colores</div>

                <div class="d-flex align-center mb-4">
                  <div class="mr-4">
                    <div class="text-caption mb-1">Color primario</div>
                    <v-color-picker
                      v-model="settings.colorPrimario"
                      mode="hexa"
                      hide-mode-switch
                      width="150"
                    />
                  </div>
                  <div>
                    <div class="text-caption mb-1">Color secundario</div>
                    <v-color-picker
                      v-model="settings.colorSecundario"
                      mode="hexa"
                      hide-mode-switch
                      width="150"
                    />
                  </div>
                </div>

                <div class="mt-4">
                  <div class="text-caption mb-2">Vista previa</div>
                  <div class="d-flex">
                    <v-btn :color="settings.colorPrimario" class="mr-2">Botón primario</v-btn>
                    <v-btn :color="settings.colorSecundario">Botón secundario</v-btn>
                  </div>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined" rounded="xl" class="pa-4">
                <div class="text-subtitle-1 font-weight-bold mb-4">Redes sociales</div>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.instagram"
                      label="Instagram"
                      prepend-inner-icon="mdi-instagram"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.facebook"
                      label="Facebook"
                      prepend-inner-icon="mdi-facebook"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.tiktok"
                      label="TikTok"
                      prepend-inner-icon="mdi-tiktok"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="settings.whatsapp"
                      label="WhatsApp"
                      prepend-inner-icon="mdi-whatsapp"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Tab Horarios -->
        <div v-show="activeTab === 'horarios'">
          <v-row>
            <v-col cols="12">
              <v-card variant="outlined" rounded="xl" class="pa-4">
                <div class="text-subtitle-1 font-weight-bold mb-4">Horarios de atención</div>
                <v-row v-for="(horario, index) in settings.horarios" :key="index" class="mb-3">
                  <v-col cols="12" md="3">
                    <v-select
                      v-model="horario.dia"
                      :items="diasSemana"
                      label="Día"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-switch
                      v-model="horario.abierto"
                      label="Abierto"
                      color="success"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="12" md="3" v-if="horario.abierto">
                    <v-text-field
                      v-model="horario.apertura"
                      label="Apertura"
                      type="time"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="3" v-if="horario.abierto">
                    <v-text-field
                      v-model="horario.cierre"
                      label="Cierre"
                      type="time"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Tab Integraciones -->
        <div v-show="activeTab === 'integraciones'">
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="xl" class="pa-4">
                <div class="d-flex align-center mb-4">
                  <v-icon icon="mdi-webhook" size="32" class="mr-3" color="primary" />
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">Webhook</div>
                    <div class="text-caption text-grey">
                      Recibe notificaciones de pedidos en tu sistema
                    </div>
                  </div>
                </div>
                <v-text-field
                  v-model="settings.webhookUrl"
                  label="URL del webhook"
                  variant="outlined"
                  density="comfortable"
                  placeholder="https://tu-sistema.com/webhook"
                />
                <v-btn variant="tonal" @click="testWebhook" :loading="testingWebhook" block>
                  Probar webhook
                </v-btn>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="xl" class="pa-4">
                <div class="d-flex align-center mb-4">
                  <v-icon icon="mdi-api" size="32" class="mr-3" color="primary" />
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">API Keys</div>
                    <div class="text-caption text-grey">Para integraciones externas</div>
                  </div>
                </div>
                <v-text-field
                  v-model="settings.apiKey"
                  label="API Key"
                  variant="outlined"
                  density="comfortable"
                  readonly
                  :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
                  :type="showApiKey ? 'text' : 'password'"
                  @click:append-inner="showApiKey = !showApiKey"
                />
                <v-btn variant="tonal" @click="regenerateApiKey" block> Regenerar API Key </v-btn>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined" rounded="xl" class="pa-4">
                <div class="d-flex align-center mb-4">
                  <v-icon icon="mdi-impression" size="32" class="mr-3" color="primary" />
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">Código de integración</div>
                    <div class="text-caption text-grey">
                      Para incrustar el menú en tu página web
                    </div>
                  </div>
                </div>
                <v-textarea
                  :value="embedCode"
                  label="Código iframe"
                  rows="3"
                  variant="outlined"
                  readonly
                  class="mb-2"
                />
                <v-btn variant="tonal" @click="copyEmbedCode">
                  <v-icon icon="mdi-content-copy" class="mr-1" />
                  Copiar código
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Tab Facturación -->
        <div v-show="activeTab === 'facturacion'">
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="xl" class="pa-4">
                <div class="text-subtitle-1 font-weight-bold mb-4">Plan actual</div>
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="text-h4 font-weight-bold" :class="planClass">
                      {{ planNombre }}
                    </div>
                    <div class="text-caption text-grey">
                      {{ planDescripcion }}
                    </div>
                  </div>
                  <v-chip :color="planColor" size="large"> ${{ planPrecio }}/mes </v-chip>
                </div>
                <v-divider class="my-4" />
                <div class="d-flex justify-space-between">
                  <span class="text-grey">Próxima facturación</span>
                  <span class="font-weight-bold">{{ formatFecha(settings.fechaVencimiento) }}</span>
                </div>
                <div class="d-flex justify-space-between mt-2">
                  <span class="text-grey">Método de pago</span>
                  <span class="font-weight-bold">{{
                    settings.metodoPago || 'Transferencia bancaria'
                  }}</span>
                </div>
                <v-btn color="primary" variant="outlined" block class="mt-4" @click="upgradePlan">
                  Cambiar plan
                </v-btn>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="xl" class="pa-4">
                <div class="text-subtitle-1 font-weight-bold mb-4">Historial de pagos</div>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Método</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="pago in historialPagos" :key="pago.fecha">
                      <td>{{ formatFecha(pago.fecha) }}</td>
                      <td>${{ pago.monto.toLocaleString() }}</td>
                      <td>{{ pago.metodo }}</td>
                      <td>
                        <v-chip
                          :color="pago.estado === 'pagado' ? 'success' : 'warning'"
                          size="x-small"
                        >
                          {{ pago.estado }}
                        </v-chip>
                      </td>
                    </tr>
                    <tr v-if="historialPagos.length === 0">
                      <td colspan="4" class="text-center text-grey py-4">
                        No hay pagos registrados
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>

    <!-- Dialog de cambio de plan -->
    <v-dialog v-model="planDialog" max-width="500">
      <v-card>
        <v-card-title>Cambiar plan</v-card-title>
        <v-card-text>
          <v-radio-group v-model="selectedPlan">
            <v-radio label="Básico - $19/mes (10 mesas)" value="basico" />
            <v-radio label="Pro - $39/mes (30 mesas)" value="pro" />
            <v-radio label="Premium - $79/mes (mesas ilimitadas)" value="premium" />
          </v-radio-group>
          <v-alert type="info" variant="tonal" class="mt-4">
            El cambio se aplicará en tu próxima facturación
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="planDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmPlanChange">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import moment from 'moment'

const authStore = useAuthStore()

// Estado
const activeTab = ref('general')
const saving = ref(false)
const generalValid = ref(false)
const testingWebhook = ref(false)
const showApiKey = ref(false)
const planDialog = ref(false)
const selectedPlan = ref('pro')

// Formularios
const generalForm = ref(null)

// Settings
const settings = ref({
  nombre: '',
  slug: '',
  email: '',
  telefono: '',
  direccion: '',
  descripcion: '',
  tipoCocina: '',
  moneda: 'CLP',
  logo: '',
  colorPrimario: '#4361EE',
  colorSecundario: '#FF6B35',
  instagram: '',
  facebook: '',
  tiktok: '',
  whatsapp: '',
  webhookUrl: '',
  apiKey: '',
  horarios: [
    { dia: 'Lunes', abierto: true, apertura: '12:00', cierre: '23:00' },
    { dia: 'Martes', abierto: true, apertura: '12:00', cierre: '23:00' },
    { dia: 'Miércoles', abierto: true, apertura: '12:00', cierre: '23:00' },
    { dia: 'Jueves', abierto: true, apertura: '12:00', cierre: '23:00' },
    { dia: 'Viernes', abierto: true, apertura: '12:00', cierre: '00:00' },
    { dia: 'Sábado', abierto: true, apertura: '12:00', cierre: '00:00' },
    { dia: 'Domingo', abierto: true, apertura: '13:00', cierre: '22:00' },
  ],
  fechaVencimiento: null,
  metodoPago: 'Transferencia bancaria',
})

const historialPagos = ref([])

// Opciones
const tiposCocina = [
  'Italiana',
  'Mexicana',
  'Japonesa',
  'China',
  'Argentina',
  'Chilena',
  'Peruana',
  'Colombiana',
  'Española',
  'Francesa',
  'Americana',
  'Vegetariana',
  'Vegana',
  'Mariscos',
  'Parrilla',
  'Pizza',
  'Sushi',
  'Otros',
]

const monedas = [
  { title: 'Peso Chileno (CLP)', value: 'CLP' },
  { title: 'Peso Argentino (ARS)', value: 'ARS' },
  { title: 'Peso Mexicano (MXN)', value: 'MXN' },
  { title: 'Peso Colombiano (COP)', value: 'COP' },
  { title: 'Dólar Americano (USD)', value: 'USD' },
  { title: 'Euro (EUR)', value: 'EUR' },
]

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// Rules
const rules = {
  required: (v) => !!v || 'Campo requerido',
  email: (v) => /.+@.+\..+/.test(v) || 'Email inválido',
  slug: (v) => /^[a-z0-9-]+$/.test(v) || 'Solo minúsculas, números y guiones',
}

// Computed
const planNombre = computed(() => {
  const plans = { basico: 'Plan Básico', pro: 'Plan Pro', premium: 'Plan Premium' }
  return plans[settings.value.plan] || 'Plan Pro'
})

const planDescripcion = computed(() => {
  const desc = {
    basico: 'Hasta 10 mesas',
    pro: 'Hasta 30 mesas',
    premium: 'Mesas ilimitadas',
  }
  return desc[settings.value.plan] || 'Hasta 30 mesas'
})

const planPrecio = computed(() => {
  const prices = { basico: 19, pro: 39, premium: 79 }
  return prices[settings.value.plan] || 39
})

const planClass = computed(() => {
  const classes = { basico: 'text-success', pro: 'text-primary', premium: 'text-accent' }
  return classes[settings.value.plan] || 'text-primary'
})

const planColor = computed(() => {
  const colors = { basico: 'success', pro: 'primary', premium: 'accent' }
  return colors[settings.value.plan] || 'primary'
})

const embedCode = computed(() => {
  return `<iframe src="https://qrfeed.ib.com/embed/${settings.value.slug}" width="100%" height="800" frameborder="0" style="border: none;"></iframe>`
})

// Métodos
const loadSettings = async () => {
  if (!authStore.tenantId) return

  const restDoc = await getDoc(doc(db, 'tenants', authStore.tenantId))
  if (restDoc.exists()) {
    const data = restDoc.data()
    settings.value = {
      ...settings.value,
      ...data,
      horarios: data.horarios || settings.value.horarios,
    }

    // Cargar historial de pagos si existe
    if (data.historialPagos) {
      historialPagos.value = data.historialPagos
    } else {
      // Datos de ejemplo
      historialPagos.value = [
        { fecha: new Date(2024, 3, 15), monto: 39000, metodo: 'Transferencia', estado: 'pagado' },
        { fecha: new Date(2024, 2, 15), monto: 39000, metodo: 'Transferencia', estado: 'pagado' },
      ]
    }
  }
}

const saveAllSettings = async () => {
  saving.value = true

  try {
    await updateDoc(doc(db, 'tenants', authStore.tenantId), {
      nombre: settings.value.nombre,
      slug: settings.value.slug,
      email: settings.value.email,
      telefono: settings.value.telefono,
      direccion: settings.value.direccion,
      descripcion: settings.value.descripcion,
      tipoCocina: settings.value.tipoCocina,
      moneda: settings.value.moneda,
      logo: settings.value.logo,
      colorPrimario: settings.value.colorPrimario,
      colorSecundario: settings.value.colorSecundario,
      instagram: settings.value.instagram,
      facebook: settings.value.facebook,
      tiktok: settings.value.tiktok,
      whatsapp: settings.value.whatsapp,
      webhookUrl: settings.value.webhookUrl,
      horarios: settings.value.horarios,
      updatedAt: new Date(),
    })

    alert('✅ Configuración guardada exitosamente')
  } catch (error) {
    console.error(error)
    alert('Error al guardar: ' + error.message)
  } finally {
    saving.value = false
  }
}

const uploadLogo = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    // Aquí se subiría a Firebase Storage
    // Por ahora solo mostramos un mensaje
    alert('Subida de imágenes: implementar con Firebase Storage')
  }
  input.click()
}

const testWebhook = async () => {
  if (!settings.value.webhookUrl) {
    alert('Primero ingresa una URL de webhook')
    return
  }

  testingWebhook.value = true

  try {
    const response = await fetch(settings.value.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'test',
        timestamp: new Date().toISOString(),
        message: 'Test de conexión desde QRFeed',
      }),
    })

    if (response.ok) {
      alert('✅ Webhook probado exitosamente')
    } else {
      alert('❌ Error al probar webhook')
    }
  } catch (error) {
    alert('❌ Error de conexión: ' + error.message)
  } finally {
    testingWebhook.value = false
  }
}

const regenerateApiKey = () => {
  const newKey =
    'qr_' +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  settings.value.apiKey = newKey
  alert('✅ Nueva API Key generada')
}

const copyEmbedCode = () => {
  navigator.clipboard.writeText(embedCode.value)
  alert('✅ Código copiado al portapapeles')
}

const upgradePlan = () => {
  selectedPlan.value = settings.value.plan
  planDialog.value = true
}

const confirmPlanChange = () => {
  settings.value.plan = selectedPlan.value
  planDialog.value = false
  alert(`✅ Plan cambiado a ${planNombre.value}`)
}

const formatFecha = (date) => {
  if (!date) return '-'
  if (date.toDate) date = date.toDate()
  return moment(date).format('DD/MM/YYYY')
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.border {
  border: 2px solid #e0e0e0;
}
</style>
