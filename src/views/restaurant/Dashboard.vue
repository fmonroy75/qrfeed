<!-- src/views/restaurant/Dashboard.vue -->
<template>
  <div>
    <!-- Welcome Banner -->
    <v-card rounded="xl" color="primary" class="mb-6 text-white" elevation="0">
      <v-card-text class="pa-6">
        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="text-h5 font-weight-bold">¡Bienvenido, {{ restaurante.nombre }}!</div>
            <div class="text-subtitle-1 opacity-90 mt-2">
              Hoy es un gran día para vender más con QRFeed
            </div>
          </div>
          <v-avatar size="80" rounded="lg" class="bg-white">
            <v-icon icon="mdi-qrcode-scan" size="48" color="primary" />
          </v-avatar>
        </div>
      </v-card-text>
    </v-card>

    <!-- KPI Cards -->
    <v-row>
      <v-col v-for="stat in stats" :key="stat.title" cols="12" md="3">
        <v-card elevation="2" rounded="xl" class="pa-4">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-grey text-uppercase font-weight-medium">
                {{ stat.title }}
              </div>
              <div class="text-h3 font-weight-bold mt-2">
                {{ stat.value }}
              </div>
              <div class="text-caption mt-2" :class="stat.trendColor">
                <v-icon :icon="stat.trendIcon" size="small" />
                {{ stat.trend }}
              </div>
            </div>
            <v-avatar :color="stat.color" size="48" rounded="lg">
              <v-icon :icon="stat.icon" size="28" color="white" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gráficos -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card rounded="xl" elevation="2">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6 font-weight-bold">Ventas últimas 7 días</span>
            <v-chip color="primary" variant="tonal" size="small">
              {{ totalVentasSemana }} pedidos
            </v-chip>
          </v-card-title>
          <v-card-text>
            <canvas ref="salesChart" height="250"></canvas>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="xl" elevation="2">
          <v-card-title class="text-h6 font-weight-bold"> Platos más pedidos </v-card-title>
          <v-card-text>
            <v-list density="compact" class="bg-transparent">
              <v-list-item v-for="(item, index) in topPlatos" :key="item.nombre" class="px-0">
                <template v-slot:prepend>
                  <div class="text-h6 font-weight-bold mr-3" :class="getMedalColor(index)">
                    #{{ index + 1 }}
                  </div>
                </template>
                <v-list-item-title>{{ item.nombre }}</v-list-item-title>
                <template v-slot:append>
                  <span class="font-weight-bold">{{ item.cantidad }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Pedidos Activos -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card rounded="xl" elevation="2">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6 font-weight-bold">Pedidos activos</span>
            <v-btn color="primary" variant="text" to="/dashboard/pedidos">
              Ver todos
              <v-icon icon="mdi-arrow-right" end />
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-table>
            <thead>
              <tr>
                <th>Mesa</th>
                <th>Items</th>
                <th>Total</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pedido in pedidosActivos" :key="pedido.id">
                <td class="font-weight-medium">{{ pedido.mesaId }}</td>
                <td>{{ pedido.items.length }} items</td>
                <td>${{ pedido.total?.toLocaleString() || 0 }}</td>
                <td>{{ formatHora(pedido.horaApertura) }}</td>
                <td>
                  <v-chip :color="pedido.enviadoACocina ? 'success' : 'warning'" size="small">
                    {{ pedido.enviadoACocina ? 'Enviado' : 'Pendiente' }}
                  </v-chip>
                </td>
                <td>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="primary"
                    @click="verPedido(pedido)"
                  >
                    <v-icon icon="mdi-eye" size="small" />
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="success"
                    @click="marcarListo(pedido)"
                    v-if="!pedido.enviadoACocina"
                  >
                    <v-icon icon="mdi-check" size="small" />
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
          <v-card-text v-if="pedidosActivos.length === 0" class="text-center py-8">
            <v-icon icon="mdi-clipboard-list" size="48" color="grey-lighten-1" />
            <div class="text-grey mt-2">No hay pedidos activos</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase'
import { collection, query, where, onSnapshot, getDocs, updateDoc, doc } from 'firebase/firestore'
import Chart from 'chart.js/auto'
import moment from 'moment'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref([
  {
    title: 'Pedidos hoy',
    value: 0,
    icon: 'mdi-clipboard-list',
    color: '#4361EE',
    trend: '+12%',
    trendIcon: 'mdi-trending-up',
    trendColor: 'text-success',
  },
  {
    title: 'Ventas hoy',
    value: '$0',
    icon: 'mdi-currency-usd',
    color: '#10B981',
    trend: '+8%',
    trendIcon: 'mdi-trending-up',
    trendColor: 'text-success',
  },
  {
    title: 'Mesas ocupadas',
    value: 0,
    icon: 'mdi-table-furniture',
    color: '#F59E0B',
    trend: '2 libres',
    trendIcon: 'mdi-information',
    trendColor: 'text-info',
  },
  {
    title: 'Clientes atendidos',
    value: 0,
    icon: 'mdi-account-group',
    color: '#8B5CF6',
    trend: '+5%',
    trendIcon: 'mdi-trending-up',
    trendColor: 'text-success',
  },
])

const restaurante = ref({})
const pedidosActivos = ref([])
const topPlatos = ref([])
const totalVentasSemana = ref(0)

let salesChart = null
let unsubscribePedidos = null

const formatHora = (timestamp) => {
  return timestamp?.toDate ? moment(timestamp.toDate()).format('HH:mm') : '-'
}

const getMedalColor = (index) => {
  const colors = ['text-yellow-600', 'text-grey-darken-1', 'text-orange-600']
  return colors[index] || 'text-grey'
}

const calcularStats = (pedidos) => {
  const hoy = new Date().toDateString()
  const pedidosHoy = pedidos.filter((p) => {
    return p.horaApertura?.toDate().toDateString() === hoy
  })

  stats.value[0].value = pedidosHoy.length
  stats.value[1].value = `$${pedidosHoy.reduce((sum, p) => sum + (p.total || 0), 0).toLocaleString()}`

  // Contar mesas ocupadas
  // Esto vendrá de otra consulta
}

const calcularTopPlatos = (pedidos) => {
  const platosMap = new Map()
  pedidos.forEach((pedido) => {
    pedido.items?.forEach((item) => {
      const existing = platosMap.get(item.nombre)
      if (existing) {
        existing.cantidad += item.cantidad
      } else {
        platosMap.set(item.nombre, { nombre: item.nombre, cantidad: item.cantidad })
      }
    })
  })

  topPlatos.value = Array.from(platosMap.values())
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)
}

const cargarDatos = async () => {
  if (!authStore.tenantId) return

  // Cargar restaurante
  const restDoc = await getDoc(doc(db, 'tenants', authStore.tenantId))
  if (restDoc.exists()) {
    restaurante.value = { id: restDoc.id, ...restDoc.data() }
  }

  // Suscribirse a pedidos
  const pedidosRef = collection(db, 'tenants', authStore.tenantId, 'pedidos')
  const q = query(pedidosRef, where('estado', '==', 'abierto'))

  unsubscribePedidos = onSnapshot(q, (snapshot) => {
    pedidosActivos.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    calcularStats(pedidosActivos.value)
    calcularTopPlatos(pedidosActivos.value)
    renderSalesChart()
  })
}

const renderSalesChart = () => {
  if (salesChart) salesChart.destroy()

  const ctx = document.querySelector('canvas')?.getContext('2d')
  if (!ctx) return

  // Datos de ejemplo - en producción vendrían de Firestore
  salesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Ventas ($)',
          data: [120000, 145000, 180000, 220000, 280000, 340000, 410000],
          borderColor: '#4361EE',
          backgroundColor: 'rgba(67, 97, 238, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom' },
      },
    },
  })
}

const verPedido = (pedido) => {
  router.push(`/dashboard/pedidos/${pedido.id}`)
}

const marcarListo = async (pedido) => {
  await updateDoc(doc(db, 'tenants', authStore.tenantId, 'pedidos', pedido.id), {
    enviadoACocina: true,
    horaEnvio: new Date(),
  })
}

onMounted(() => {
  cargarDatos()
})

onUnmounted(() => {
  if (unsubscribePedidos) unsubscribePedidos()
  if (salesChart) salesChart.destroy()
})
</script>

<style scoped>
.text-yellow-600 {
  color: #d97706;
}
.text-grey-darken-1 {
  color: #757575;
}
.text-orange-600 {
  color: #ea580c;
}
</style>
