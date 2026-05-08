<!-- src/views/client/MenuView.vue -->
<template>
  <div>
    <!-- Categorías tabs -->
    <v-tabs
      v-model="selectedCategory"
      color="primary"
      align-tabs="center"
      class="mb-4 bg-white rounded-lg"
    >
      <v-tab v-for="cat in categories" :key="cat" :value="cat">
        {{ cat }}
      </v-tab>
    </v-tabs>

    <!-- Productos por categoría -->
    <v-window v-model="selectedCategory">
      <v-window-item v-for="cat in categories" :key="cat" :value="cat">
        <v-row>
          <v-col v-for="item in itemsByCategory[cat]" :key="item.id" cols="12" sm="6">
            <v-card rounded="xl" elevation="2" class="product-card">
              <v-img
                v-if="item.imagen"
                :src="item.imagen"
                height="160"
                cover
                class="rounded-t-xl"
              />
              <v-img
                v-else
                src="https://placehold.co/400x160/e2e8f0/94a3b8?text=Sin+imagen"
                height="160"
                cover
                class="rounded-t-xl"
              />

              <v-card-text class="pa-4">
                <div class="d-flex justify-space-between align-start">
                  <div>
                    <div class="text-h6 font-weight-bold">{{ item.nombre }}</div>
                    <div class="text-caption text-grey mt-1">{{ item.descripcion }}</div>
                  </div>
                  <div class="text-h6 font-weight-bold text-primary">
                    ${{ item.precio.toLocaleString() }}
                  </div>
                </div>

                <v-btn color="primary" variant="tonal" block class="mt-3" @click="addToCart(item)">
                  <v-icon icon="mdi-plus" class="mr-1" />
                  Agregar
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card v-if="itemsByCategory[cat]?.length === 0" class="text-center pa-8" rounded="xl">
          <v-icon icon="mdi-food-off" size="48" color="grey-lighten-1" />
          <div class="text-grey mt-2">No hay productos en esta categoría</div>
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'

const route = useRoute()
const tenantId = inject('tenantId')
const addToCart = inject('addToCart')

const selectedCategory = ref('')
const menuItems = ref([])

const categories = computed(() => {
  return [...new Set(menuItems.value.map((item) => item.categoria))]
})

const itemsByCategory = computed(() => {
  const grouped = {}
  categories.value.forEach((cat) => {
    grouped[cat] = menuItems.value.filter((item) => item.categoria === cat)
  })
  return grouped
})

const loadMenu = async () => {
  if (!tenantId()) return

  const menuRef = collection(db, 'tenants', tenantId(), 'menu')
  const snapshot = await getDocs(menuRef)
  menuItems.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  if (menuItems.value.length > 0 && categories.value.length > 0) {
    selectedCategory.value = categories.value[0]
  }
}

onMounted(() => {
  loadMenu()
})
</script>

<style scoped>
.product-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}
</style>
