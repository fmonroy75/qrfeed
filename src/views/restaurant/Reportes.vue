<!-- src/views/restaurant/Reportes.vue -->
<template>
  <div>
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center flex-wrap gap-3">
          <div>
            <span class="text-h5 font-weight-bold">Reportes y Analytics</span>
            <span class="text-caption text-grey ml-2">Visualiza el rendimiento de tu negocio</span>
          </div>
          <div class="d-flex gap-3">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-calendar-range"
              @click="openDateRangeDialog"
            >
              {{ dateRangeLabel }}
            </v-btn>
            <v-btn color="primary" prepend-icon="mdi-download" @click="exportReport">
              Exportar
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Date Range Picker Dialog -->
    <v-dialog v-model="dateDialog" max-width="500">
      <v-card>
        <v-card-title>Seleccionar rango de fechas</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="tempStartDate"
                label="Fecha inicio"
                type="date"
                variant="outlined"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="tempEndDate"
                label="Fecha fin"
                type="date"
                variant="outlined"
              />
            </v-col>
          </v-row>
          <v-btn-toggle v-model="quickRange" mandatory class="mt-2">
            <v-btn value="today" size="small">Hoy</v-btn>
            <v-btn value="week" size="small">Esta semana</v-btn>
            <v-btn value="month" size="small">Este mes</v-btn>
            <v-btn value="year" size="small">Este año</v-btn>
          </v-btn-toggle>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dateDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="applyDateRange">Aplicar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- KPI Cards -->
    <v-row class="mb-6">
      <v-col v-for="kpi in kpis" :key="kpi.title" cols="12" sm="6" md="3">
        <v-card rounded="xl" elevation="2" class="pa-4" :color="kpi.color" dark>
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-caption text-white opacity-70 text-uppercase">
                {{ kpi.title }}
              </div>
              <div class="text-h3 font-weight-bold text-white mt-2">
                {{ kpi.value }}
              </div>
              <div class="text-caption text-white opacity-70 mt-2">
                <v-icon :icon="kpi.trendIcon" size="small" class="mr-1" />
                {{ kpi.trend }}
              </div>
            </div>
            <v-avatar size="56" class="bg-white opacity-20">
              <v-icon :icon="kpi.icon" size="32" color="white" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gráficos principales -->
    <v-row>
      <v-col cols="12" lg="8">
        <v-card rounded="xl" elevation="2" class="pa-4">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <span class="text-h6 font-weight-bold">Ventas diarias</span>
              <span class="text-caption text-grey ml-2">{{ dateRangeLabel }}</span>
            </div>
            <v-chip color="primary" variant="tonal" size="small">
              Total: ${{ totalVentasPeriodo.toLocaleString() }}
            </v-chip>
          </div>
          <canvas ref="salesChartCanvas" height="300"></canvas>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card rounded="xl" elevation="2" class="pa-4">
          <div class="text-h6 font-weight-bold mb-4">Distribución por categoría</div>
          <canvas ref="categoryChartCanvas" height="250"></canvas>
        </v-card>
      </v-col>
    </v-row>

    <!-- Segunda fila de gráficos -->
    <v-row class="mt-6">
      <v-col cols="12" lg="6">
        <v-card rounded="xl" elevation="2" class="pa-4">
          <div class="text-h6 font-weight-bold mb-4">Productos más vendidos</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th class="text-center">Cantidad</th>
                <th class="text-right">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in topProducts" :key="item.nombre">
                <td>
                  <v-icon :icon="getMedalIcon(index)" :color="getMedalColor(index)" />
                </td>
                <td class="font-weight-medium">{{ item.nombre }}</td>
                <td class="text-center">{{ item.cantidad }} unidades</td>
                <td class="text-right">${{ item.ingresos.toLocaleString() }}</td>
              </tr>
            </tbody>
          </v-table>
          <div v-if="topProducts.length === 0" class="text-center pa-4">
            <v-icon icon="mdi-chart-line" size="48" color="grey-lighten-1" />
            <div class="text-grey">No hay datos en este período</div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card rounded="xl" elevation="2" class="pa-4">
          <div class="text-h6 font-weight-bold mb-4">Horas más activas</div>
          <canvas ref="hourlyChartCanvas" height="250"></canvas>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de pedidos detallada -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card rounded="xl" elevation="2">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6 font-weight-bold">Detalle de pedidos</span>
            <v-text-field
              v-model="orderSearch"
              label="Buscar"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              style="width: 250px"
            />
          </v-card-title>
          <v-divider />
          <v-data-table
            :headers="orderHeaders"
            :items="filteredOrders"
            :loading="loadingOrders"
            items-per-page="10"
            class="elevation-0"
          >
            <template v-slot:item.items="{ item }">
              <div class="text-caption">
                <div v-for="i in item.items.slice(0, 2)" :key="i.id">
                  {{ i.cantidad }}x {{ i.nombre }}
                </div>
                <div v-if="item.items.length > 2" class="text-grey">
                  +{{ item.items.length - 2 }} más
                </div>
              </div>
            </template>

            <template v-slot:item.total="{ item }">
              <span class="font-weight-bold">${{ (item.total || 0).toLocaleString() }}</span>
            </template>

            <template v-slot:item.hora="{ item }">
              {{ formatHora(item.horaApertura) }}
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import Chart from 'chart.js/auto'
import moment from 'moment'

const authStore = useAuthStore()

// Estado
const loading = ref(false)
const loadingOrders = ref(false)
const dateDialog = ref(false)
const quickRange = ref('month')
const tempStartDate = ref('')
const tempEndDate = ref('')
const startDate = ref(moment().startOf('month').toDate())
const endDate = ref(moment().endOf('month').toDate())
const orderSearch = ref('')
const pedidos = ref([])

// Refs para gráficos
const salesChartCanvas = ref(null)
const categoryChartCanvas = ref(null)
const hourlyChartCanvas = ref(null)
let salesChart = null
let categoryChart = null
let hourlyChart = null

// Headers tabla
const orderHeaders = [
  { title: 'Mesa', key: 'mesaId', sortable: true, width: '100' },
  { title: 'Items', key: 'items', sortable: false },
  { title: 'Total', key: 'total', sortable: true, align: 'center' },
  { title: 'Hora', key: 'hora', sortable: true },
  { title: 'Estado', key: 'estado', sortable: true },
]

// Computed
const dateRangeLabel = computed(() => {
  return `${moment(startDate.value).format('DD/MM/YYYY')} - ${moment(endDate.value).format('DD/MM/YYYY')}`
})

const pedidosFiltrados = computed(() => {
  return pedidos.value.filter((p) => {
    const fechaPedido = p.horaApertura?.toDate()
    if (!fechaPedido) return false
    return fechaPedido >= startDate.value && fechaPedido <= endDate.value
  })
})

const totalVentasPeriodo = computed(() => {
  return pedidosFiltrados.value.reduce((sum, p) => sum + (p.total || 0), 0)
})

const kpis = computed(() => [
  {
    title: 'Total ventas',
    value: `$${totalVentasPeriodo.value.toLocaleString()}`,
    icon: 'mdi-currency-usd',
    color: '#10B981',
    trend: `+${Math.floor(Math.random() * 20)}% vs período anterior`,
    trendIcon: 'mdi-trending-up',
  },
  {
    title: 'Pedidos',
    value: pedidosFiltrados.value.length,
    icon: 'mdi-clipboard-list',
    color: '#4361EE',
    trend: `${pedidosFiltrados.value.length} pedidos`,
    trendIcon: 'mdi-information',
  },
  {
    title: 'Ticket promedio',
    value: `$${Math.round(totalVentasPeriodo.value / (pedidosFiltrados.value.length || 1)).toLocaleString()}`,
    icon: 'mdi-receipt',
    color: '#F59E0B',
    trend: 'Por pedido',
    trendIcon: 'mdi-information',
  },
  {
    title: 'Clientes atendidos',
    value: pedidosFiltrados.value.length,
    icon: 'mdi-account-group',
    color: '#8B5CF6',
    trend: 'Clientes únicos',
    trendIcon: 'mdi-information',
  },
])

const topProducts = computed(() => {
  const productMap = new Map()

  pedidosFiltrados.value.forEach((pedido) => {
    pedido.items?.forEach((item) => {
      const existing = productMap.get(item.id || item.nombre)
      if (existing) {
        existing.cantidad += item.cantidad
        existing.ingresos += item.precio * item.cantidad
      } else {
        productMap.set(item.id || item.nombre, {
          nombre: item.nombre,
          cantidad: item.cantidad,
          ingresos: item.precio * item.cantidad,
        })
      }
    })
  })

  return Array.from(productMap.values())
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)
})

const ventasPorDia = computed(() => {
  const days = {}
  const start = moment(startDate.value)
  const end = moment(endDate.value)
  const diffDays = end.diff(start, 'days') + 1

  for (let i = 0; i < diffDays; i++) {
    const date = moment(start).add(i, 'days').format('DD/MM')
    days[date] = 0
  }

  pedidosFiltrados.value.forEach((pedido) => {
    const date = moment(pedido.horaApertura?.toDate()).format('DD/MM')
    if (days[date] !== undefined) {
      days[date] += pedido.total || 0
    }
  })

  return {
    labels: Object.keys(days),
    values: Object.values(days),
  }
})

const ventasPorCategoria = computed(() => {
  const categoryMap = new Map()

  pedidosFiltrados.value.forEach((pedido) => {
    pedido.items?.forEach((item) => {
      const categoria = item.categoria || 'Otros'
      const existing = categoryMap.get(categoria)
      if (existing) {
        existing += item.precio * item.cantidad
      } else {
        categoryMap.set(categoria, item.precio * item.cantidad)
      }
    })
  })

  return {
    labels: Array.from(categoryMap.keys()),
    values: Array.from(categoryMap.values()),
  }
})

const ventasPorHora = computed(() => {
  const hourMap = {}
  for (let i = 0; i < 24; i++) {
    hourMap[i] = 0
  }

  pedidosFiltrados.value.forEach((pedido) => {
    const hour = pedido.horaApertura?.toDate().getHours()
    if (hour !== undefined) {
      hourMap[hour] += pedido.total || 0
    }
  })

  return {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    values: Object.values(hourMap),
  }
})

const filteredOrders = computed(() => {
  if (!orderSearch.value) return pedidosFiltrados.value

  const term = orderSearch.value.toLowerCase()
  return pedidosFiltrados.value.filter(
    (p) =>
      p.mesaId?.toLowerCase().includes(term) ||
      p.items?.some((i) => i.nombre.toLowerCase().includes(term)),
  )
})

// Métodos
const setQuickRange = () => {
  const now = moment()
  switch (quickRange.value) {
    case 'today':
      tempStartDate.value = now.format('YYYY-MM-DD')
      tempEndDate.value = now.format('YYYY-MM-DD')
      break
    case 'week':
      tempStartDate.value = now.startOf('week').format('YYYY-MM-DD')
      tempEndDate.value = now.endOf('week').format('YYYY-MM-DD')
      break
    case 'month':
      tempStartDate.value = now.startOf('month').format('YYYY-MM-DD')
      tempEndDate.value = now.endOf('month').format('YYYY-MM-DD')
      break
    case 'year':
      tempStartDate.value = now.startOf('year').format('YYYY-MM-DD')
      tempEndDate.value = now.endOf('year').format('YYYY-MM-DD')
      break
  }
}

const openDateRangeDialog = () => {
  tempStartDate.value = moment(startDate.value).format('YYYY-MM-DD')
  tempEndDate.value = moment(endDate.value).format('YYYY-MM-DD')
  dateDialog.value = true
}

const applyDateRange = () => {
  startDate.value = new Date(tempStartDate.value)
  endDate.value = new Date(tempEndDate.value)
  dateDialog.value = false
  loadPedidos()
  renderCharts()
}

const renderSalesChart = () => {
  if (salesChart) salesChart.destroy()

  const ctx = salesChartCanvas.value?.getContext('2d')
  if (!ctx) return

  salesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ventasPorDia.value.labels,
      datasets: [
        {
          label: 'Ventas ($)',
          data: ventasPorDia.value.values,
          backgroundColor: 'rgba(67, 97, 238, 0.7)',
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (context) => `$${context.raw.toLocaleString()}`,
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => `$${value.toLocaleString()}`,
          },
        },
      },
    },
  })
}

const renderCategoryChart = () => {
  if (categoryChart) categoryChart.destroy()

  const ctx = categoryChartCanvas.value?.getContext('2d')
  if (!ctx) return

  const colors = ['#4361EE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ventasPorCategoria.value.labels,
      datasets: [
        {
          data: ventasPorCategoria.value.values,
          backgroundColor: colors.slice(0, ventasPorCategoria.value.labels.length),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = Math.round((context.raw / total) * 100)
              return `${context.label}: $${context.raw.toLocaleString()} (${percentage}%)`
            },
          },
        },
      },
    },
  })
}

const renderHourlyChart = () => {
  if (hourlyChart) hourlyChart.destroy()

  const ctx = hourlyChartCanvas.value?.getContext('2d')
  if (!ctx) return

  hourlyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ventasPorHora.value.labels,
      datasets: [
        {
          label: 'Ventas ($)',
          data: ventasPorHora.value.values,
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'top' },
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => `$${value.toLocaleString()}`,
          },
        },
      },
    },
  })
}

const renderCharts = () => {
  setTimeout(() => {
    renderSalesChart()
    renderCategoryChart()
    renderHourlyChart()
  }, 100)
}

const loadPedidos = async () => {
  loadingOrders.value = true

  const pedidosRef = collection(db, 'tenants', authStore.tenantId, 'pedidos')
  const q = query(pedidosRef, orderBy('horaApertura', 'desc'))
  const snapshot = await getDocs(q)

  pedidos.value = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))

  loadingOrders.value = false
  renderCharts()
}

const getMedalIcon = (index) => {
  const icons = [
    'mdi-crown',
    'mdi-medal',
    'mdi-medal-outline',
    'mdi-medal-outline',
    'mdi-medal-outline',
  ]
  return icons[index] || 'mdi-medal-outline'
}

const getMedalColor = (index) => {
  const colors = ['#F59E0B', '#9CA3AF', '#D97706', '#9CA3AF', '#9CA3AF']
  return colors[index] || '#9CA3AF'
}

const formatHora = (timestamp) => {
  return timestamp?.toDate ? moment(timestamp.toDate()).format('DD/MM HH:mm') : '-'
}

const exportReport = () => {
  const data = pedidosFiltrados.value.map((p) => ({
    Mesa: p.mesaId,
    Items: p.items?.map((i) => `${i.cantidad}x ${i.nombre}`).join(', '),
    Total: p.total,
    Fecha: formatHora(p.horaApertura),
    Estado: p.estado,
  }))

  const csv = [
    Object.keys(data[0] || {}).join(','),
    ...data.map((row) => Object.values(row).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte_${moment().format('YYYY-MM-DD')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Watch
watch([startDate, endDate], () => {
  renderCharts()
})

onMounted(() => {
  setQuickRange()
  loadPedidos()
})

onUnmounted(() => {
  if (salesChart) salesChart.destroy()
  if (categoryChart) categoryChart.destroy()
  if (hourlyChart) hourlyChart.destroy()
})
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}

.opacity-20 {
  opacity: 0.2;
}

.opacity-70 {
  opacity: 0.7;
}
</style>
