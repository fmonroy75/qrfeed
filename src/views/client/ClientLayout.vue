<!-- src/views/client/ClientLayout.vue -->
<template>
  <v-app>
    <!-- App Bar simplificada para cliente -->
    <v-app-bar color="white" elevation="1" class="border-bottom">
      <v-container class="pa-2">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="mdi-qrcode-scan" color="primary" size="28" class="mr-2" />
            <div>
              <div class="text-subtitle-2 text-grey">Menú digital</div>
              <div class="text-h6 font-weight-bold">{{ restaurante?.nombre || 'Cargando...' }}</div>
            </div>
          </div>

          <!-- Carrito button -->
          <v-btn
            v-if="cartItems.length > 0"
            color="primary"
            rounded="pill"
            variant="tonal"
            @click="showCart = true"
          >
            <v-icon icon="mdi-cart" class="mr-1" />
            {{ cartItems.length }}
          </v-btn>
        </div>
      </v-container>
    </v-app-bar>

    <!-- Main content -->
    <v-main class="bg-grey-lighten-4">
      <v-container class="pa-3 pb-16">
        <router-view />
      </v-container>
    </v-main>

    <!-- Bottom Navigation (para móvil) -->
    <v-bottom-navigation v-model="bottomNav" color="primary" grow>
      <v-btn value="menu">
        <v-icon icon="mdi-food" />
        <span>Menú</span>
      </v-btn>
      <v-btn value="cart" @click="showCart = true" v-if="cartItems.length > 0">
        <v-icon icon="mdi-cart" />
        <span>Pedido</span>
        <v-badge :content="cartItems.length" color="error" floating />
      </v-btn>
      <v-btn value="info">
        <v-icon icon="mdi-information" />
        <span>Info</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- Cart Dialog -->
    <v-dialog v-model="showCart" max-width="500" fullscreen="mobile">
      <v-card rounded="xl">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span class="text-h6 font-weight-bold">Mi pedido</span>
          <v-btn icon variant="text" @click="showCart = false">
            <v-icon icon="mdi-close" />
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <v-list>
            <v-list-item v-for="(item, index) in cartItems" :key="index" class="mb-2">
              <template v-slot:prepend>
                <v-avatar color="primary-lighten-4" size="40">
                  <v-icon icon="mdi-food" color="primary" />
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold">{{ item.nombre }}</v-list-item-title>
              <v-list-item-subtitle>${{ item.precio.toLocaleString() }}</v-list-item-subtitle>

              <template v-slot:append>
                <div class="d-flex align-center">
                  <v-btn icon variant="text" size="small" @click="updateQuantity(item, -1)">
                    <v-icon icon="mdi-minus" size="small" />
                  </v-btn>
                  <span class="mx-2 font-weight-bold">{{ item.cantidad }}</span>
                  <v-btn icon variant="text" size="small" @click="updateQuantity(item, 1)">
                    <v-icon icon="mdi-plus" size="small" />
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    size="small"
                    @click="removeItem(index)"
                    class="ml-2"
                  >
                    <v-icon icon="mdi-delete" size="small" />
                  </v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>

          <v-divider class="my-4" />

          <div class="d-flex justify-space-between align-center">
            <span class="text-h6">Total</span>
            <span class="text-h5 font-weight-bold text-primary"
              >${{ totalCart.toLocaleString() }}</span
            >
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn
            color="primary"
            size="large"
            block
            rounded="xl"
            :loading="sendingOrder"
            @click="sendOrder"
          >
            <v-icon icon="mdi-send" class="mr-2" />
            Enviar pedido a cocina
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" icon="mdi-close" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '@/firebase'
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore'

const route = useRoute()
const router = useRouter()

const restaurante = ref(null)
const tenantId = ref(null)
const mesaId = ref(null)
const pedidoId = ref(null)

const cartItems = ref([])
const showCart = ref(false)
const sendingOrder = ref(false)
const bottomNav = ref('menu')
const snackbar = ref({ show: false, text: '', color: 'success' })

const totalCart = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
})

// Cargar tenant desde la URL
const loadTenant = async () => {
  const slug = route.params.slug
  const mesa = route.params.mesaId

  if (!slug) {
    snackbar.value = { show: true, text: 'Restaurante no encontrado', color: 'error' }
    return
  }

  mesaId.value = mesa

  // Buscar tenant por slug
  const slugDoc = await getDoc(doc(db, 'slugIndex', slug))

  if (slugDoc.exists()) {
    tenantId.value = slugDoc.data().tenantId

    // Cargar datos del restaurante
    const restDoc = await getDoc(doc(db, 'tenants', tenantId.value))
    if (restDoc.exists()) {
      restaurante.value = { id: restDoc.id, ...restDoc.data() }
    }

    // Buscar pedido activo para esta mesa
    await loadActiveOrder()
  } else {
    snackbar.value = { show: true, text: 'Restaurante no encontrado', color: 'error' }
  }
}

const loadActiveOrder = async () => {
  const pedidosRef = collection(db, 'tenants', tenantId.value, 'pedidos')
  const q = query(pedidosRef, where('mesaId', '==', mesaId.value), where('estado', '==', 'abierto'))
  const snapshot = await getDocs(q)

  if (!snapshot.empty) {
    const pedido = snapshot.docs[0]
    pedidoId.value = pedido.id
    cartItems.value = pedido.data().items || []
  }
}

const updateQuantity = (item, delta) => {
  const index = cartItems.value.findIndex((i) => i.id === item.id)
  if (index !== -1) {
    const newQuantity = cartItems.value[index].cantidad + delta
    if (newQuantity <= 0) {
      cartItems.value.splice(index, 1)
    } else {
      cartItems.value[index].cantidad = newQuantity
    }
  }
}

const removeItem = (index) => {
  cartItems.value.splice(index, 1)
}

const sendOrder = async () => {
  if (cartItems.value.length === 0) {
    snackbar.value = { show: true, text: 'Agrega items al pedido', color: 'warning' }
    return
  }

  sendingOrder.value = true

  try {
    const pedidosRef = collection(db, 'tenants', tenantId.value, 'pedidos')

    if (pedidoId.value) {
      // Actualizar pedido existente
      await updateDoc(doc(db, 'tenants', tenantId.value, 'pedidos', pedidoId.value), {
        items: cartItems.value,
        total: totalCart.value,
        enviadoACocina: true,
        horaEnvio: new Date(),
      })
    } else {
      // Crear nuevo pedido
      const nuevoPedido = {
        mesaId: mesaId.value,
        estado: 'abierto',
        items: cartItems.value,
        total: totalCart.value,
        horaApertura: new Date(),
        enviadoACocina: true,
        horaEnvio: new Date(),
      }

      const docRef = await addDoc(pedidosRef, nuevoPedido)
      pedidoId.value = docRef.id
    }

    // Limpiar carrito
    cartItems.value = []
    showCart.value = false

    snackbar.value = {
      show: true,
      text: '✅ Pedido enviado a cocina',
      color: 'success',
    }

    // Redirigir a confirmación después de 2 segundos
    setTimeout(() => {
      router.push(`/confirmacion/${route.params.slug}/${mesaId.value}`)
    }, 2000)
  } catch (error) {
    console.error(error)
    snackbar.value = { show: true, text: 'Error al enviar pedido', color: 'error' }
  } finally {
    sendingOrder.value = false
  }
}

// Proveer funciones a los componentes hijos
provide('addToCart', (item) => {
  const existing = cartItems.value.find((i) => i.id === item.id)
  if (existing) {
    existing.cantidad++
  } else {
    cartItems.value.push({ ...item, cantidad: 1 })
  }
  snackbar.value = { show: true, text: `${item.nombre} agregado`, color: 'success' }
})

provide('tenantId', () => tenantId.value)
provide('restaurante', () => restaurante.value)
provide('mesaId', () => mesaId.value)

watch(bottomNav, (newVal) => {
  if (newVal === 'menu') {
    router.push(`/menu/${route.params.slug}/${route.params.mesaId}`)
  } else if (newVal === 'info') {
    router.push(`/info/${route.params.slug}`)
  }
})

onMounted(() => {
  loadTenant()
})
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}
</style>
