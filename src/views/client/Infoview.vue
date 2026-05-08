<!-- src/views/client/InfoView.vue -->
<template>
  <div>
    <!-- Header con logo -->
    <v-card rounded="xl" elevation="2" class="mb-4 text-center pa-4">
      <v-avatar size="100" rounded="lg" class="mx-auto mb-3">
        <v-img v-if="restaurante?.logo" :src="restaurante.logo" />
        <v-icon v-else icon="mdi-store" size="64" color="primary" />
      </v-avatar>
      <div class="text-h5 font-weight-bold">{{ restaurante?.nombre }}</div>
      <div class="text-caption text-grey mt-1">
        {{ restaurante?.tipoCocina || 'Restaurante' }}
      </div>
    </v-card>

    <!-- Horarios -->
    <v-card rounded="xl" elevation="2" class="mb-4">
      <v-card-title class="text-h6 font-weight-bold pa-4">
        <v-icon icon="mdi-clock" class="mr-2" color="primary" />
        Horarios
      </v-card-title>
      <v-divider />
      <v-list class="bg-transparent">
        <v-list-item v-for="horario in horarios" :key="horario.dia">
          <v-list-item-title>{{ horario.dia }}</v-list-item-title>
          <template v-slot:append>
            <span class="text-body-2">{{ horario.hora }}</span>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Ubicación -->
    <v-card rounded="xl" elevation="2" class="mb-4">
      <v-card-title class="text-h6 font-weight-bold pa-4">
        <v-icon icon="mdi-map-marker" class="mr-2" color="primary" />
        Ubicación
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <div class="d-flex align-center mb-3">
          <v-icon icon="mdi-google-maps" class="mr-2" color="error" />
          <span>{{ restaurante?.direccion || 'No disponible' }}</span>
        </div>
        <v-btn
          v-if="restaurante?.direccion"
          color="primary"
          variant="tonal"
          block
          :href="`https://maps.google.com/?q=${encodeURIComponent(restaurante.direccion)}`"
          target="_blank"
        >
          <v-icon icon="mdi-navigation" class="mr-1" />
          Cómo llegar
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Contacto -->
    <v-card rounded="xl" elevation="2" class="mb-4">
      <v-card-title class="text-h6 font-weight-bold pa-4">
        <v-icon icon="mdi-phone" class="mr-2" color="primary" />
        Contacto
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <div class="d-flex align-center mb-3" v-if="restaurante?.telefono">
          <v-icon icon="mdi-whatsapp" class="mr-2" color="success" />
          <span>{{ restaurante.telefono }}</span>
          <v-btn
            icon
            variant="text"
            size="small"
            color="success"
            :href="`https://wa.me/${restaurante.telefono.replace(/\D/g, '')}`"
            target="_blank"
            class="ml-auto"
          >
            <v-icon icon="mdi-send" size="small" />
          </v-btn>
        </div>
        <div class="d-flex align-center" v-if="restaurante?.email">
          <v-icon icon="mdi-email" class="mr-2" color="info" />
          <span>{{ restaurante.email }}</span>
        </div>
      </v-card-text>
    </v-card>

    <!-- Redes Sociales -->
    <v-card rounded="xl" elevation="2" v-if="hasSocial">
      <v-card-title class="text-h6 font-weight-bold pa-4">
        <v-icon icon="mdi-share-variant" class="mr-2" color="primary" />
        Redes Sociales
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <div class="d-flex justify-around">
          <v-btn
            v-if="restaurante?.instagram"
            :href="restaurante.instagram"
            target="_blank"
            icon="mdi-instagram"
            variant="text"
            color="pink"
            size="large"
          />
          <v-btn
            v-if="restaurante?.facebook"
            :href="restaurante.facebook"
            target="_blank"
            icon="mdi-facebook"
            variant="text"
            color="blue"
            size="large"
          />
          <v-btn
            v-if="restaurante?.tiktok"
            :href="restaurante.tiktok"
            target="_blank"
            icon="mdi-tiktok"
            variant="text"
            color="black"
            size="large"
          />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'

const restaurante = inject('restaurante')

const horarios = ref([
  { dia: 'Lunes', hora: '12:00 - 23:00' },
  { dia: 'Martes', hora: '12:00 - 23:00' },
  { dia: 'Miércoles', hora: '12:00 - 23:00' },
  { dia: 'Jueves', hora: '12:00 - 23:00' },
  { dia: 'Viernes', hora: '12:00 - 00:00' },
  { dia: 'Sábado', hora: '12:00 - 00:00' },
  { dia: 'Domingo', hora: '13:00 - 22:00' },
])

const hasSocial = computed(() => {
  return restaurante.value?.instagram || restaurante.value?.facebook || restaurante.value?.tiktok
})
</script>
