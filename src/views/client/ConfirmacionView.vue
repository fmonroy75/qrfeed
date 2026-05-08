<!-- src/views/client/ConfirmacionView.vue -->
<template>
  <div class="text-center pa-6">
    <!-- Animación de éxito -->
    <v-icon
      icon="mdi-check-circle"
      color="success"
      size="80"
      class="mb-4"
      style="animation: bounce 0.5s ease-out"
    />

    <div class="text-h5 font-weight-bold mb-2">¡Pedido enviado!</div>
    <div class="text-body-1 text-grey mb-4">
      Tu pedido ha sido enviado a cocina.
      <br />
      El mesero te atenderá en breve.
    </div>

    <!-- Resumen del pedido -->
    <v-card rounded="xl" elevation="2" class="mb-6 text-left">
      <v-card-text class="pa-4">
        <div class="d-flex justify-space-between mb-2">
          <span class="font-weight-bold">Mesa:</span>
          <span>{{ mesaId }}</span>
        </div>
        <v-divider class="my-2" />
        <div v-for="item in ultimoPedido" :key="item.id" class="d-flex justify-space-between mb-2">
          <span>{{ item.cantidad }}x {{ item.nombre }}</span>
          <span>${{ (item.precio * item.cantidad).toLocaleString() }}</span>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex justify-space-between font-weight-bold">
          <span>Total</span>
          <span class="text-primary">${{ totalUltimoPedido.toLocaleString() }}</span>
        </div>
      </v-card-text>
    </v-card>

    <!-- Acciones -->
    <v-btn color="primary" size="large" rounded="xl" class="mb-3" :to="`/menu/${slug}/${mesaId}`">
      <v-icon icon="mdi-plus" class="mr-1" />
      Seguir pidiendo
    </v-btn>

    <v-btn variant="text" size="large" rounded="xl" :to="`/info/${slug}`">
      Ver información del restaurante
    </v-btn>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '@/firebase'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'

const route = useRoute()
const tenantId = inject('tenantId')
const slug = route.params.slug
const mesaId = route.params.mesaId

const ultimoPedido = ref([])
const totalUltimoPedido = ref(0)

const cargarUltimoPedido = async () => {
  if (!tenantId()) return

  const pedidosRef = collection(db, 'tenants', tenantId(), 'pedidos')
  const q = query(
    pedidosRef,
    where('mesaId', '==', mesaId),
    orderBy('horaApertura', 'desc'),
    limit(1),
  )

  const snapshot = await getDocs(q)
  if (!snapshot.empty) {
    const pedido = snapshot.docs[0].data()
    ultimoPedido.value = pedido.items || []
    totalUltimoPedido.value = pedido.total || 0
  }
}

onMounted(() => {
  cargarUltimoPedido()
})
</script>

<style>
@keyframes bounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
