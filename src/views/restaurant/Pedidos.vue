<!-- src/views/restaurant/Pedidos.vue -->
<template>
  <div>
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center flex-wrap gap-3">
          <div>
            <span class="text-h5 font-weight-bold">Pedidos</span>
            <span class="text-caption text-grey ml-2">Gestiona los pedidos en tiempo real</span>
          </div>
          <div class="d-flex gap-3">
            <v-chip color="primary" variant="tonal">
              <v-icon icon="mdi-clock-outline" class="mr-1" size="small" />
              Actualización en vivo
            </v-chip>
            <v-btn
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="refreshPedidos"
              :loading="refreshing"
            >
              Refrescar
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Tabs de estado -->
    <v-card rounded="xl" elevation="2" class="mb-6">
      <v-tabs v-model="activeTab" color="primary" align-tabs="center" show-arrows>
        <v-tab value="pendientes">
          <v-badge
            :content="pedidosPendientes.length"
            color="error"
            :model-value="pedidosPendientes.length > 0"
          >
            <v-icon icon="mdi-clock-alert" class="mr-1" size="small" />
            Pendientes
          </v-badge>
        </v-tab>
        <v-tab value="preparacion">
          <v-badge
            :content="pedidosPreparacion.length"
            color="warning"
            :model-value="pedidosPreparacion.length > 0"
          >
            <v-icon icon="mdi-food" class="mr-1" size="small" />
            En preparación
          </v-badge>
        </v-tab>
        <v-tab value="listos">
          <v-badge
            :content="pedidosListos.length"
            color="success"
            :model-value="pedidosListos.length > 0"
          >
            <v-icon icon="mdi-check-circle" class="mr-1" size="small" />
            Listos para servir
          </v-badge>
        </v-tab>
        <v-tab value="historial">
          <v-icon icon="mdi-history" class="mr-1" size="small" />
          Historial
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Panel de Pendientes -->
    <div v-show="activeTab === 'pendientes'">
      <v-row>
        <v-col v-for="pedido in pedidosPendientes" :key="pedido.id" cols="12" md="6" lg="4">
          <PedidoCard :pedido="pedido" @aceptar="aceptarPedido" @rechazar="rechazarPedido" />
        </v-col>
      </v-row>
      <v-card v-if="pedidosPendientes.length === 0" class="text-center pa-8" rounded="xl">
        <v-icon icon="mdi-check-circle-outline" size="64" color="success" />
        <div class="text-h6 mt-2">¡Todo al día!</div>
        <div class="text-body-2 text-grey">No hay pedidos pendientes</div>
      </v-card>
    </div>

    <!-- Panel de En Preparación -->
    <div v-show="activeTab === 'preparacion'">
      <v-row>
        <v-col v-for="pedido in pedidosPreparacion" :key="pedido.id" cols="12" md="6" lg="4">
          <PedidoCard :pedido="pedido" modo="preparacion" @listo="marcarListo" />
        </v-col>
      </v-row>
    </div>

    <!-- Panel de Listos -->
    <div v-show="activeTab === 'listos'">
      <v-row>
        <v-col v-for="pedido in pedidosListos" :key="pedido.id" cols="12" md="6" lg="4">
          <PedidoCard :pedido="pedido" modo="listo" @servir="marcarServido" />
        </v-col>
      </v-row>
    </div>

    <!-- Panel de Historial -->
    <div v-show="activeTab === 'historial'">
      <v-card rounded="xl" elevation="2">
        <v-data-table
          :headers="historyHeaders"
          :items="pedidosHistorial"
          :loading="loadingHistory"
          :search="historySearch"
          items-per-page="15"
          class="elevation-0"
        >
          <template v-slot:top>
            <div class="pa-4">
              <v-text-field
                v-model="historySearch"
                label="Buscar por mesa"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
              />
            </div>
          </template>

          <template v-slot:item.items="{ item }">
            <div class="text-caption">
              <div v-for="i in item.items.slice(0, 3)" :key="i.id">
                {{ i.cantidad }}x {{ i.nombre }}
              </div>
              <div v-if="item.items.length > 3" class="text-grey">
                +{{ item.items.length - 3 }} más
              </div>
            </div>
          </template>

          <template v-slot:item.total="{ item }">
            <span class="font-weight-bold">${{ item.total?.toLocaleString() || 0 }}</span>
          </template>

          <template v-slot:item.horaApertura="{ item }">
            {{ formatHora(item.horaApertura) }}
          </template>

          <template v-slot:item.horaEnvio="{ item }">
            {{ formatHora(item.horaEnvio) }}
          </template>

          <template v-slot:item.estado="{ item }">
            <v-chip :color="estadoColors[item.estado]" size="small">
              {{ estadoLabels[item.estado] }}
            </v-chip>
          </template>
        </v-data-table>
      </v-card>
    </div>

    <!-- Sonido de nuevo pedido -->
    <audio ref="newOrderSound" src="/sounds/new-order.mp3" preload="auto" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  limit,
} from 'firebase/firestore'
import PedidoCard from './components/PedidoCard.vue'
import moment from 'moment'

const authStore = useAuthStore()

// Estado
const activeTab = ref('pendientes')
const refreshing = ref(false)
const loadingHistory = ref(false)
const historySearch = ref('')
const pedidos = ref([])
const lastCount = ref(0)
const newOrderSound = ref(null)

// Headers para historial
const historyHeaders = [
  { title: 'Mesa', key: 'mesaId', sortable: true, width: '80' },
  { title: 'Items', key: 'items', sortable: false },
  { title: 'Total', key: 'total', sortable: true, align: 'center' },
  { title: 'Hora pedido', key: 'horaApertura', sortable: true },
  { title: 'Hora envío', key: 'horaEnvio', sortable: true },
  { title: 'Estado', key: 'estado', sortable: true },
]

const estadoColors = {
  pendiente: 'warning',
  aceptado: 'info',
  preparacion: 'primary',
  listo: 'success',
  servido: 'success',
  cancelado: 'error',
  completado: 'grey',
}

const estadoLabels = {
  pendiente: 'Pendiente',
  aceptado: 'Aceptado',
  preparacion: 'En preparación',
  listo: 'Listo',
  servido: 'Servido',
  cancelado: 'Cancelado',
  completado: 'Completado',
}

// Computed
const pedidosPendientes = computed(() => {
  return pedidos.value.filter((p) => p.estado === 'pendiente' && !p.enviadoACocina)
})

const pedidosPreparacion = computed(() => {
  return pedidos.value.filter((p) => p.estado === 'aceptado' || p.estado === 'preparacion')
})

const pedidosListos = computed(() => {
  return pedidos.value.filter((p) => p.estado === 'listo')
})

const pedidosHistorial = computed(() => {
  return pedidos.value.filter(
    (p) => p.estado === 'completado' || p.estado === 'servido' || p.estado === 'cancelado',
  )
})

// Suscripción en tiempo real
let unsubscribePedidos = null

const loadPedidos = () => {
  const pedidosRef = collection(db, 'tenants', authStore.tenantId, 'pedidos')
  const q = query(pedidosRef, orderBy('horaApertura', 'desc'))

  unsubscribePedidos = onSnapshot(q, (snapshot) => {
    const newPedidos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      horaApertura: doc.data().horaApertura,
      horaEnvio: doc.data().horaEnvio,
    }))

    // Detectar nuevos pedidos pendientes
    const newPendingCount = newPedidos.filter(
      (p) => p.estado === 'pendiente' && !p.enviadoACocina,
    ).length
    const oldPendingCount = pedidos.value.filter(
      (p) => p.estado === 'pendiente' && !p.enviadoACocina,
    ).length

    if (newPendingCount > oldPendingCount && activeTab.value === 'pendientes') {
      // Reproducir sonido
      if (newOrderSound.value) {
        newOrderSound.value.play().catch((e) => console.log('Audio no soportado'))
      }

      // Mostrar notificación
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('¡Nuevo pedido!', {
          body: `Hay ${newPendingCount - oldPendingCount} pedido(s) nuevo(s)`,
          icon: '/favicon.ico',
        })
      }
    }

    pedidos.value = newPedidos
    lastCount.value = newPendingCount
  })
}

const refreshPedidos = async () => {
  refreshing.value = true
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

const aceptarPedido = async (pedido) => {
  await updateDoc(doc(db, 'tenants', authStore.tenantId, 'pedidos', pedido.id), {
    estado: 'aceptado',
    horaAceptacion: new Date(),
  })
}

const rechazarPedido = async (pedido) => {
  if (confirm(`¿Rechazar pedido de mesa ${pedido.mesaId}?`)) {
    await updateDoc(doc(db, 'tenants', authStore.tenantId, 'pedidos', pedido.id), {
      estado: 'cancelado',
      horaCancelacion: new Date(),
      motivoCancelacion: 'Rechazado por cocina',
    })
  }
}

const marcarListo = async (pedido) => {
  await updateDoc(doc(db, 'tenants', authStore.tenantId, 'pedidos', pedido.id), {
    estado: 'listo',
    horaListo: new Date(),
  })
}

const marcarServido = async (pedido) => {
  await updateDoc(doc(db, 'tenants', authStore.tenantId, 'pedidos', pedido.id), {
    estado: 'servido',
    horaServido: new Date(),
  })

  // Opcional: cambiar estado de la mesa a libre
  // await updateDoc(doc(db, 'tenants', authStore.tenantId, 'mesas', pedido.mesaId), {
  //   estado: 'libre',
  //   pedidoActualId: null
  // })
}

const formatHora = (timestamp) => {
  return timestamp?.toDate ? moment(timestamp.toDate()).format('HH:mm') : '-'
}

// Solicitar permiso para notificaciones
const requestNotificationPermission = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

// Actualizar mesa al cerrar pedido
watch(activeTab, (newVal) => {
  if (newVal === 'pendientes' && pedidosPendientes.value.length > lastCount.value) {
    if (newOrderSound.value) {
      newOrderSound.value.play().catch((e) => console.log('Audio no soportado'))
    }
  }
})

onMounted(() => {
  loadPedidos()
  requestNotificationPermission()
})

onUnmounted(() => {
  if (unsubscribePedidos) unsubscribePedidos()
})
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
