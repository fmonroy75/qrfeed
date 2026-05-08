<!-- src/views/restaurant/components/PedidoCard.vue -->
<template>
  <v-card rounded="xl" elevation="2" hover class="pedido-card" :class="claseBorde">
    <v-card-title class="pa-4 bg-grey-lighten-5 border-bottom">
      <div class="d-flex justify-space-between align-center">
        <div>
          <v-chip :color="colorMesa" size="small" class="mr-2">
            <v-icon icon="mdi-table-furniture" size="small" class="mr-1" />
            Mesa {{ pedido.mesaId }}
          </v-chip>
          <span class="text-caption text-grey ml-2">
            {{ formatHora(pedido.horaApertura) }}
          </span>
        </div>
        <div class="text-h6 font-weight-bold text-primary">
          ${{ (pedido.total || 0).toLocaleString() }}
        </div>
      </div>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Items del pedido -->
      <div
        v-for="item in pedido.items"
        :key="item.id"
        class="d-flex justify-space-between align-center mb-2"
      >
        <div>
          <span class="font-weight-bold">{{ item.cantidad }}x</span>
          <span class="ml-2">{{ item.nombre }}</span>
        </div>
        <div class="text-body-2">${{ (item.precio * item.cantidad).toLocaleString() }}</div>
      </div>

      <v-divider class="my-3" />

      <!-- Comentarios adicionales -->
      <div v-if="pedido.comentarios" class="bg-warning-lighten-5 pa-3 rounded-lg mb-2">
        <v-icon icon="mdi-message-text" size="small" color="warning" class="mr-1" />
        <span class="text-caption">{{ pedido.comentarios }}</span>
      </div>

      <!-- Tiempo de espera -->
      <div class="d-flex align-center mt-2">
        <v-icon icon="mdi-clock-outline" size="small" class="mr-1 text-grey" />
        <span class="text-caption text-grey"> Tiempo espera: {{ tiempoEspera }} </span>
      </div>
    </v-card-text>

    <v-divider />

    <v-card-actions class="pa-3">
      <template v-if="modo === 'pendiente'">
        <v-btn color="success" variant="tonal" block @click="$emit('aceptar', pedido)">
          <v-icon icon="mdi-check" class="mr-1" />
          Aceptar pedido
        </v-btn>
        <v-btn color="error" variant="text" @click="$emit('rechazar', pedido)">
          <v-icon icon="mdi-close" />
        </v-btn>
      </template>

      <template v-if="modo === 'preparacion'">
        <v-btn color="primary" variant="tonal" block @click="$emit('listo', pedido)">
          <v-icon icon="mdi-food" class="mr-1" />
          Marcar como listo
        </v-btn>
      </template>

      <template v-if="modo === 'listo'">
        <v-btn color="success" variant="tonal" block @click="$emit('servir', pedido)">
          <v-icon icon="mdi-waiter" class="mr-1" />
          Servir a la mesa
        </v-btn>
      </template>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import moment from 'moment'

const props = defineProps({
  pedido: {
    type: Object,
    required: true,
  },
  modo: {
    type: String,
    default: 'pendiente', // pendiente, preparacion, listo
    validator: (value) => ['pendiente', 'preparacion', 'listo'].includes(value),
  },
})

const emit = defineEmits(['aceptar', 'rechazar', 'listo', 'servir'])

const colorMesa = computed(() => {
  const mesa = props.pedido.mesaId
  const colores = ['primary', 'secondary', 'success', 'info', 'warning']
  const index = parseInt(mesa?.replace(/\D/g, '') || '0') % colores.length
  return colores[index]
})

const claseBorde = computed(() => {
  if (props.modo === 'pendiente') return 'border-left-warning'
  if (props.modo === 'preparacion') return 'border-left-primary'
  if (props.modo === 'listo') return 'border-left-success'
  return ''
})

const tiempoEspera = computed(() => {
  if (!props.pedido.horaApertura) return '0 min'
  const inicio = props.pedido.horaApertura.toDate()
  const ahora = new Date()
  const diff = Math.floor((ahora - inicio) / 1000 / 60)
  return `${diff} min`
})

const formatHora = (timestamp) => {
  return timestamp?.toDate ? moment(timestamp.toDate()).format('HH:mm') : '-'
}
</script>

<style scoped>
.pedido-card {
  transition: all 0.3s ease;
  border-left-width: 4px;
  border-left-style: solid;
  border-left-color: transparent;
}

.pedido-card:hover {
  transform: translateY(-2px);
}

.border-left-warning {
  border-left-color: #ffc107;
}

.border-left-primary {
  border-left-color: #4361ee;
}

.border-left-success {
  border-left-color: #4caf50;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.bg-warning-lighten-5 {
  background-color: rgba(255, 193, 7, 0.1);
}

.rounded-lg {
  border-radius: 8px;
}
</style>
