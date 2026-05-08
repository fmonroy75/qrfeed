<!-- src/views/Landing.vue -->
<template>
  <div>
    <!-- Hero Section -->
    <v-parallax src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600" height="600">
      <v-container class="fill-height">
        <v-row align="center" justify="center">
          <v-col cols="12" md="8" class="text-center">
            <v-chip color="secondary" size="large" class="mb-4" variant="elevated">
              🚀 Lanzamiento oficial
            </v-chip>

            <div class="text-h2 font-weight-bold text-white mb-4">Menú digital con QR</div>

            <div class="text-h6 text-white opacity-90 mb-8">
              Tus clientes piden desde su celular. Tu cocina recibe pedidos al instante. Sin apps,
              sin complicaciones.
            </div>

            <div class="d-flex justify-center gap-4">
              <v-btn color="secondary" size="x-large" to="/register" class="px-6">
                Probar gratis 14 días
                <v-icon icon="mdi-arrow-right" end />
              </v-btn>

              <v-btn variant="outlined" size="x-large" color="white" href="#como-funciona">
                Ver demo
                <v-icon icon="mdi-play-circle" end />
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-parallax>

    <!-- Features Section -->
    <v-container id="como-funciona" class="py-12">
      <v-row justify="center" class="mb-8">
        <v-col cols="12" md="8" class="text-center">
          <v-chip color="primary" variant="tonal" class="mb-4"> Características premium </v-chip>
          <div class="text-h3 font-weight-bold mb-4">Todo lo que tu restaurante necesita</div>
          <div class="text-subtitle-1 text-grey">
            Diseñado para restaurantes que quieren destacar
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col v-for="feature in features" :key="feature.title" cols="12" md="4">
          <v-card class="pa-4 text-center" elevation="2" hover>
            <v-avatar :color="feature.color" size="64" class="mb-4">
              <v-icon :icon="feature.icon" size="32" color="white" />
            </v-avatar>
            <div class="text-h6 font-weight-bold mb-2">{{ feature.title }}</div>
            <div class="text-body-2 text-grey">{{ feature.description }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Pricing Section -->
    <v-container class="py-12 bg-grey-lighten-4" fluid>
      <v-row justify="center" class="mb-8">
        <v-col cols="12" md="6" class="text-center">
          <v-chip color="secondary" variant="tonal" class="mb-4"> Planes simples </v-chip>
          <div class="text-h3 font-weight-bold mb-4">Precios sin sorpresas</div>
          <div class="text-subtitle-1 text-grey">
            Sin comisiones por transacción. Cancela cuando quieras.
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col v-for="plan in plans" :key="plan.name" cols="12" md="4">
          <v-card
            :class="{ 'border-primary': plan.recommended }"
            :elevation="plan.recommended ? 8 : 2"
            class="text-center pa-4"
          >
            <div v-if="plan.recommended" class="text-caption text-primary font-weight-bold mb-2">
              MÁS POPULAR
            </div>
            <div class="text-h5 font-weight-bold mb-2">{{ plan.name }}</div>
            <div class="text-h3 font-weight-bold text-primary mb-2">
              ${{ plan.price }}
              <span class="text-subtitle-1 text-grey">/mes</span>
            </div>
            <v-divider class="my-4" />
            <v-list density="compact" class="bg-transparent">
              <v-list-item v-for="feature in plan.features" :key="feature" class="px-0">
                <template v-slot:prepend>
                  <v-icon icon="mdi-check-circle" color="success" size="small" />
                </template>
                <v-list-item-title class="text-body-2">{{ feature }}</v-list-item-title>
              </v-list-item>
            </v-list>
            <v-btn
              :color="plan.recommended ? 'primary' : 'secondary'"
              variant="flat"
              size="large"
              block
              class="mt-6"
              :to="plan.ctaLink"
            >
              {{ plan.ctaText }}
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
const features = [
  {
    title: 'Menú digital interactivo',
    description: 'Categorías, imágenes, precios y disponibilidad en tiempo real',
    icon: 'mdi-food',
    color: '#4361EE',
  },
  {
    title: 'QR por mesa',
    description: 'Genera códigos QR únicos para cada mesa, imprime y pega',
    icon: 'mdi-qrcode',
    color: '#FF6B35',
  },
  {
    title: 'Pedidos en tiempo real',
    description: 'Los pedidos llegan instantáneamente a la cocina',
    icon: 'mdi-clock-fast',
    color: '#10B981',
  },
  {
    title: 'Dashboard para meseros',
    description: 'Gestiona todas las mesas desde una tablet o celular',
    icon: 'mdi-view-dashboard',
    color: '#8B5CF6',
  },
  {
    title: 'Cierre de cuenta automático',
    description: 'Calcula el total automáticamente sin errores',
    icon: 'mdi-calculator',
    color: '#F59E0B',
  },
  {
    title: 'Reportes y analytics',
    description: 'Ventas, platos más pedidos, horas pico',
    icon: 'mdi-chart-line',
    color: '#EC4899',
  },
]

const plans = [
  {
    name: 'Básico',
    price: 19,
    features: [
      'Hasta 10 mesas',
      'Menú digital',
      'QR por mesa',
      'Pedidos a cocina',
      'Soporte email',
    ],
    ctaText: 'Comenzar',
    ctaLink: '/register',
    recommended: false,
  },
  {
    name: 'Pro',
    price: 39,
    features: [
      'Hasta 30 mesas',
      'Todo del plan básico',
      'Dashboard meseros',
      'Reportes avanzados',
      'Soporte prioritario',
      'Sin comisiones',
    ],
    ctaText: 'Comenzar',
    ctaLink: '/register',
    recommended: true,
  },
  {
    name: 'Premium',
    price: 79,
    features: [
      'Mesas ilimitadas',
      'Todo del plan Pro',
      'Dominio personalizado',
      'API integración',
      'Soporte 24/7',
      'Branding removido',
    ],
    ctaText: 'Contactar',
    ctaLink: '/contact',
    recommended: false,
  },
]
</script>

<style scoped>
.border-primary {
  border: 2px solid #4361ee;
}
</style>
