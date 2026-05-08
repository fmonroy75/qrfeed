<!-- src/views/restaurant/Mesas.vue -->
<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <span class="text-h5 font-weight-bold">Mesas</span>
            <span class="text-caption text-grey ml-2">Gestiona tus mesas y códigos QR</span>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
            Agregar mesa
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Grid de mesas -->
    <v-row>
      <v-col v-for="mesa in mesas" :key="mesa.id" cols="12" md="3">
        <v-card rounded="xl" elevation="2" :class="{ 'border-primary': mesa.estado === 'ocupada' }">
          <v-card-text class="text-center pa-4">
            <v-avatar
              :color="mesa.estado === 'ocupada' ? 'error' : 'success'"
              size="56"
              class="mb-3"
            >
              <v-icon icon="mdi-table-furniture" size="32" color="white" />
            </v-avatar>
            <div class="text-h5 font-weight-bold">{{ mesa.id }}</div>
            <div
              class="text-caption mb-3"
              :class="mesa.estado === 'ocupada' ? 'text-error' : 'text-success'"
            >
              {{ mesa.estado === 'ocupada' ? 'Ocupada' : 'Libre' }}
            </div>

            <!-- QR Code -->
            <div class="d-flex justify-center mb-3">
              <qrcode-vue :value="qrUrl(mesa.id)" :size="120" />
            </div>

            <v-divider class="my-3" />

            <div class="d-flex justify-center gap-2">
              <v-btn
                :color="mesa.estado === 'ocupada' ? 'warning' : 'success'"
                size="small"
                variant="tonal"
                @click="toggleMesa(mesa)"
              >
                {{ mesa.estado === 'ocupada' ? 'Liberar' : 'Ocupar' }}
              </v-btn>
              <v-btn color="error" size="small" variant="tonal" @click="deleteMesa(mesa)">
                Eliminar
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog crear mesa -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>Agregar nueva mesa</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="newMesaId"
              label="Número de mesa"
              placeholder="Ej: M01, M02, Barra 1"
              variant="outlined"
              :rules="[rules.required]"
            />
            <v-alert type="info" variant="tonal" class="mt-4">
              Se generará un código QR único para esta mesa.
              <br />
              <strong>URL:</strong> {{ qrPreviewUrl }}
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="createMesa">Crear</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog imprimir QR -->
    <v-dialog v-model="printDialog" max-width="800">
      <v-card>
        <v-card-title>Imprimir códigos QR</v-card-title>
        <v-card-text>
          <div ref="printArea" class="qr-print">
            <div v-for="mesa in selectedMesas" :key="mesa.id" class="qr-item">
              <qrcode-vue :value="qrUrl(mesa.id)" :size="150" />
              <div class="text-center mt-2 font-weight-bold">{{ mesa.id }}</div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="printDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="printQRs">Imprimir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore'
import QrcodeVue from 'qrcode.vue'

const authStore = useAuthStore()
const mesas = ref([])
const dialog = ref(false)
const printDialog = ref(false)
const newMesaId = ref('')
const selectedMesas = ref([])

const rules = {
  required: (v) => !!v || 'Campo requerido',
}

const baseUrl = 'https://qrfeed.ib.com'
const restaurantSlug = computed(() => {
  // Obtener slug del restaurante actual
  return 'la-buena-mesa' // Esto vendrá del store
})

const qrUrl = (mesaId) => {
  return `${baseUrl}/menu/${restaurantSlug.value}/${mesaId}`
}

const qrPreviewUrl = computed(() => {
  if (newMesaId.value) {
    return qrUrl(newMesaId.value)
  }
  return ''
})

const loadMesas = async () => {
  const mesasRef = collection(db, 'tenants', authStore.tenantId, 'mesas')
  const snapshot = await getDocs(mesasRef)
  mesas.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

const createMesa = async () => {
  if (!newMesaId.value) return

  await addDoc(collection(db, 'tenants', authStore.tenantId, 'mesas'), {
    id: newMesaId.value,
    estado: 'libre',
    createdAt: new Date(),
  })

  dialog.value = false
  newMesaId.value = ''
  loadMesas()
}

const toggleMesa = async (mesa) => {
  const newEstado = mesa.estado === 'ocupada' ? 'libre' : 'ocupada'
  await updateDoc(doc(db, 'tenants', authStore.tenantId, 'mesas', mesa.id), {
    estado: newEstado,
  })
  loadMesas()
}

const deleteMesa = async (mesa) => {
  if (confirm(`¿Eliminar mesa ${mesa.id}?`)) {
    await deleteDoc(doc(db, 'tenants', authStore.tenantId, 'mesas', mesa.id))
    loadMesas()
  }
}

const printQRs = () => {
  const printContents = document.querySelector('.qr-print').innerHTML
  const originalContents = document.body.innerHTML
  document.body.innerHTML = printContents
  window.print()
  document.body.innerHTML = originalContents
  window.location.reload()
}

onMounted(() => {
  loadMesas()
})
</script>

<style scoped>
.qr-print {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.qr-item {
  text-align: center;
  page-break-inside: avoid;
}
</style>
