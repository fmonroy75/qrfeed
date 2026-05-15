<!-- src/views/super-admin/Dashboard.vue -->
<template>
  <div>
    <!-- KPI Cards Premium -->
    <v-row class="mb-6">
      <v-col v-for="stat in stats" :key="stat.title" cols="12" md="3">
        <v-card elevation="2" rounded="xl" class="pa-4">
          <div class="d-flex justify-space-between align-start">
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

    <!-- Gráficos y Tablas -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card rounded="xl" elevation="2">
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <span class="text-h6 font-weight-bold">Ingresos mensuales</span>
              <span class="text-caption text-grey ml-2">(USD)</span>
            </div>
            <v-chip color="primary" variant="tonal" size="small"> Últimos 12 meses </v-chip>
          </v-card-title>
          <v-card-text>
            <canvas ref="incomeChartRef" height="300"></canvas>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="xl" elevation="2">
          <v-card-title class="text-h6 font-weight-bold"> Distribución por plan </v-card-title>
          <v-card-text>
            <canvas ref="planChartRef" height="250"></canvas>
            <v-divider class="my-4" />
            <v-list density="compact" class="bg-transparent">
              <v-list-item v-for="plan in planDistribution" :key="plan.name">
                <template v-slot:prepend>
                  <v-chip :color="plan.color" size="small" class="mr-2" />
                </template>
                <v-list-item-title>{{ plan.name }}</v-list-item-title>
                <template v-slot:append>
                  <span class="font-weight-bold">{{ plan.count }}</span>
                  <span class="text-caption text-grey ml-1">({{ plan.percentage }}%)</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Últimos restaurantes registrados -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card rounded="xl" elevation="2">
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <span class="text-h6 font-weight-bold">Últimos restaurantes</span>
            </div>
            <v-btn color="primary" variant="text" to="/super-admin/restaurantes">
              Ver todos
              <v-icon icon="mdi-arrow-right" end />
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-table>
            <thead>
              <tr>
                <th>Restaurante</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Vence</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rest in recentRestaurants" :key="rest.id">
                <td class="font-weight-medium">{{ rest.nombre }}</td>
                <td>{{ rest.email }}</td>
                <td>
                  <v-chip :color="planColors[rest.plan]" size="small">
                    {{ rest.plan }}
                  </v-chip>
                </td>
                <td>
                  <v-chip :color="rest.status === 'active' ? 'success' : 'error'" size="small">
                    {{ rest.status === 'active' ? 'Activo' : 'Suspendido' }}
                  </v-chip>
                </td>
                <td>{{ formatDate(rest.fechaVencimiento) }}</td>
                <td>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="primary"
                    @click="editRestaurant(rest)"
                  >
                    <v-icon icon="mdi-pencil" size="small" />
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="error"
                    @click="deleteRestaurant(rest)"
                  >
                    <v-icon icon="mdi-delete" size="small" />
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog para editar restaurante -->
    <v-dialog v-model="editDialog" max-width="600">
      <v-card>
        <v-card-title>Editar restaurante</v-card-title>
        <v-card-text>
          <v-form ref="editForm">
            <v-text-field v-model="editingRest.nombre" label="Nombre" />
            <v-text-field v-model="editingRest.email" label="Email" />
            <v-select v-model="editingRest.plan" :items="plans" label="Plan" />
            <v-select v-model="editingRest.status" :items="statuses" label="Estado" />
            <v-text-field
              v-model="editingRest.fechaVencimiento"
              type="date"
              label="Fecha vencimiento"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveRestaurant">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore'
import Chart from 'chart.js/auto'
import moment from 'moment'

const stats = ref([
  {
    title: 'Total Restaurantes',
    value: 0,
    icon: 'mdi-store',
    color: '#4361EE',
    trend: '+12%',
    trendIcon: 'mdi-trending-up',
    trendColor: 'text-success',
  },
  {
    title: 'Ingresos Mensuales',
    value: '$0',
    icon: 'mdi-currency-usd',
    color: '#10B981',
    trend: '+8%',
    trendIcon: 'mdi-trending-up',
    trendColor: 'text-success',
  },
  {
    title: 'Usuarios Activos',
    value: 0,
    icon: 'mdi-account-group',
    color: '#8B5CF6',
    trend: '+5%',
    trendIcon: 'mdi-trending-up',
    trendColor: 'text-success',
  },
  {
    title: 'Tasa de Retención',
    value: '94%',
    icon: 'mdi-chart-line',
    color: '#F59E0B',
    trend: '+2%',
    trendIcon: 'mdi-trending-up',
    trendColor: 'text-success',
  },
])

const recentRestaurants = ref([])
const planDistribution = ref([
  { name: 'Básico', count: 0, percentage: 0, color: '#10B981' },
  { name: 'Pro', count: 0, percentage: 0, color: '#4361EE' },
  { name: 'Premium', count: 0, percentage: 0, color: '#8B5CF6' },
])

const editDialog = ref(false)
const editingRest = ref({})
const plans = ['basico', 'pro', 'premium']
const statuses = ['active', 'suspended', 'trial']

const planColors = {
  basico: 'success',
  pro: 'primary',
  premium: 'accent',
}

const incomeChartRef = ref(null)
const planChartRef = ref(null)
let incomeChart = null
let planChart = null

const formatDate = (date) => {
  return date ? moment(date.toDate()).format('DD/MM/YYYY') : '-'
}

const loadDashboardData = async () => {
  // Cargar restaurantes
  const tenantsQuery = query(collection(db, 'tenants'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(tenantsQuery)
  const tenants = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  // Actualizar KPI
  stats.value[0].value = tenants.length
  stats.value[1].value = `$${tenants.reduce((sum, t) => sum + (t.plan === 'pro' ? 39 : t.plan === 'premium' ? 79 : 19), 0)}`
  stats.value[2].value = tenants.filter((t) => t.status === 'active').length

  // Distribución por plan
  const basicCount = tenants.filter((t) => t.plan === 'basico').length
  const proCount = tenants.filter((t) => t.plan === 'pro').length
  const premiumCount = tenants.filter((t) => t.plan === 'premium').length

  planDistribution.value[0].count = basicCount
  planDistribution.value[1].count = proCount
  planDistribution.value[2].count = premiumCount

  const total = tenants.length
  planDistribution.value.forEach((p) => {
    p.percentage = total > 0 ? Math.round((p.count / total) * 100) : 0
  })

  // Últimos 5 restaurantes
  recentRestaurants.value = tenants.slice(0, 5)

  // Renderizar gráficos
  renderCharts()
}

const renderCharts = () => {
  if (incomeChart) incomeChart.destroy()
  if (planChart) planChart.destroy()

  // Gráfico de ingresos
  const ctx = incomeChartRef.value?.getContext('2d')
  if (ctx) {
    incomeChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [
          'Ene',
          'Feb',
          'Mar',
          'Abr',
          'May',
          'Jun',
          'Jul',
          'Ago',
          'Sep',
          'Oct',
          'Nov',
          'Dic',
        ],
        datasets: [
          {
            label: 'Ingresos (USD)',
            data: [1200, 1450, 1800, 2200, 2800, 3400, 4100, 4900, 5600, 6200, 7100, 8400],
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

  // Gráfico de planes
  const planCtx = planChartRef.value?.getContext('2d')
  if (planCtx) {
    planChart = new Chart(planCtx, {
      type: 'doughnut',
      data: {
        labels: planDistribution.value.map((p) => p.name),
        datasets: [
          {
            data: planDistribution.value.map((p) => p.count),
            backgroundColor: ['#10B981', '#4361EE', '#8B5CF6'],
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
}

const editRestaurant = (restaurant) => {
  editingRest.value = { ...restaurant }
  editDialog.value = true
}

const saveRestaurant = async () => {
  await updateDoc(doc(db, 'tenants', editingRest.value.id), {
    nombre: editingRest.value.nombre,
    email: editingRest.value.email,
    plan: editingRest.value.plan,
    status: editingRest.value.status,
    fechaVencimiento: new Date(editingRest.value.fechaVencimiento),
  })
  editDialog.value = false
  loadDashboardData()
}

const deleteRestaurant = async (restaurant) => {
  if (confirm(`¿Eliminar ${restaurant.nombre}?`)) {
    await deleteDoc(doc(db, 'tenants', restaurant.id))
    loadDashboardData()
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>
