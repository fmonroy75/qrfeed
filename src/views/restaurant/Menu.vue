<!-- src/views/restaurant/Menu.vue -->
<template>
  <div>
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center flex-wrap gap-3">
          <div>
            <span class="text-h5 font-weight-bold">Menú</span>
            <span class="text-caption text-grey ml-2"
              >Gestiona los productos de tu restaurante</span
            >
          </div>
          <div class="d-flex gap-3">
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openProductDialog('create')">
              Nuevo producto
            </v-btn>
            <v-btn variant="outlined" prepend-icon="mdi-import" @click="importMenu">
              Importar
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Categorías Tabs -->
    <v-card rounded="xl" elevation="2" class="mb-6">
      <v-tabs v-model="activeCategory" color="primary" align-tabs="center" show-arrows>
        <v-tab value="todos">
          <v-icon icon="mdi-view-grid" class="mr-1" size="small" />
          Todos
        </v-tab>
        <v-tab v-for="cat in categories" :key="cat.id" :value="cat.id">
          <v-icon :icon="cat.icono || 'mdi-food'" class="mr-1" size="small" />
          {{ cat.nombre }}
        </v-tab>
      </v-tabs>

      <v-divider />

      <!-- Estadísticas rápidas -->
      <div class="pa-4 bg-grey-lighten-5">
        <v-row>
          <v-col cols="12" md="3">
            <div class="d-flex align-center">
              <v-icon icon="mdi-food" color="primary" class="mr-2" />
              <div>
                <div class="text-caption text-grey">Total productos</div>
                <div class="text-h6 font-weight-bold">{{ totalProductos }}</div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="d-flex align-center">
              <v-icon icon="mdi-check-circle" color="success" class="mr-2" />
              <div>
                <div class="text-caption text-grey">Activos</div>
                <div class="text-h6 font-weight-bold">{{ productosActivos }}</div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="d-flex align-center">
              <v-icon icon="mdi-close-circle" color="error" class="mr-2" />
              <div>
                <div class="text-caption text-grey">Inactivos</div>
                <div class="text-h6 font-weight-bold">{{ productosInactivos }}</div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="d-flex align-center">
              <v-icon icon="mdi-tag" color="warning" class="mr-2" />
              <div>
                <div class="text-caption text-grey">Categorías</div>
                <div class="text-h6 font-weight-bold">{{ categories.length }}</div>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <!-- Productos Grid -->
    <v-row>
      <v-col v-for="producto in filteredProducts" :key="producto.id" cols="12" sm="6" md="4" lg="3">
        <v-card rounded="xl" elevation="2" hover class="product-card">
          <!-- Imagen -->
          <div class="position-relative">
            <v-img
              :src="producto.imagen || 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Sin+imagen'"
              height="180"
              cover
              class="rounded-t-xl"
            >
              <template v-slot:placeholder>
                <v-skeleton-loader type="image" height="180" />
              </template>
            </v-img>

            <!-- Badge de estado -->
            <v-chip
              :color="producto.disponible ? 'success' : 'error'"
              size="small"
              class="position-absolute bottom-right"
              style="bottom: 12px; right: 12px"
            >
              {{ producto.disponible ? 'Disponible' : 'No disponible' }}
            </v-chip>
          </div>

          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-start mb-2">
              <div class="text-subtitle-1 font-weight-bold">{{ producto.nombre }}</div>
              <div class="text-h6 font-weight-bold text-primary">
                ${{ producto.precio.toLocaleString() }}
              </div>
            </div>

            <div class="text-caption text-grey mb-3">
              {{ producto.descripcion || 'Sin descripción' }}
            </div>

            <div class="d-flex align-center mb-2">
              <v-icon icon="mdi-tag" size="small" color="grey" class="mr-1" />
              <span class="text-caption">{{ producto.categoriaNombre || producto.categoria }}</span>

              <v-chip v-if="producto.destacado" size="x-small" color="warning" class="ml-2">
                Destacado
              </v-chip>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-3">
            <v-btn
              variant="text"
              size="small"
              color="primary"
              @click="openProductDialog('edit', producto)"
            >
              <v-icon icon="mdi-pencil" size="small" class="mr-1" />
              Editar
            </v-btn>
            <v-spacer />
            <v-btn
              variant="text"
              size="small"
              :color="producto.disponible ? 'warning' : 'success'"
              @click="toggleDisponible(producto)"
            >
              <v-icon
                :icon="producto.disponible ? 'mdi-close' : 'mdi-check'"
                size="small"
                class="mr-1"
              />
              {{ producto.disponible ? 'Desactivar' : 'Activar' }}
            </v-btn>
            <v-btn variant="text" size="small" color="error" @click="confirmDelete(producto)">
              <v-icon icon="mdi-delete" size="small" />
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Empty state -->
      <v-col v-if="filteredProducts.length === 0" cols="12">
        <v-card rounded="xl" class="text-center pa-8">
          <v-icon icon="mdi-food-off" size="64" color="grey-lighten-1" />
          <div class="text-h6 mt-4">No hay productos</div>
          <div class="text-body-2 text-grey mb-4">
            Agrega tu primer producto para empezar a vender
          </div>
          <v-btn color="primary" @click="openProductDialog('create')"> Agregar producto </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog de Producto -->
    <v-dialog v-model="productDialog" max-width="800" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-4 bg-primary text-white">
          {{ dialogMode === 'create' ? 'Nuevo producto' : 'Editar producto' }}
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            class="float-right"
            @click="productDialog = false"
          />
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="formRef" v-model="formValid">
            <v-row>
              <!-- Nombre -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="productForm.nombre"
                  label="Nombre del producto *"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <!-- Precio -->
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="productForm.precio"
                  label="Precio *"
                  type="number"
                  :rules="[rules.required, rules.number]"
                  variant="outlined"
                  density="comfortable"
                  prefix="$"
                />
              </v-col>

              <!-- Categoría -->
              <v-col cols="12" md="3">
                <v-select
                  v-model="productForm.categoria"
                  :items="categories"
                  item-title="nombre"
                  item-value="id"
                  label="Categoría *"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <!-- Descripción -->
              <v-col cols="12">
                <v-textarea
                  v-model="productForm.descripcion"
                  label="Descripción"
                  rows="3"
                  variant="outlined"
                  density="comfortable"
                  hint="Breve descripción del producto"
                />
              </v-col>

              <!-- Imagen -->
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="productForm.imagen"
                  label="URL de la imagen"
                  variant="outlined"
                  density="comfortable"
                  hint="Pega una URL de imagen (opcional)"
                />
              </v-col>

              <!-- Destacado y Disponible -->
              <v-col cols="12" md="4">
                <div class="d-flex gap-4">
                  <v-checkbox
                    v-model="productForm.destacado"
                    label="Destacar producto"
                    color="warning"
                    hide-details
                  />
                  <v-checkbox
                    v-model="productForm.disponible"
                    label="Disponible"
                    color="success"
                    hide-details
                  />
                </div>
              </v-col>
            </v-row>

            <!-- Previsualización de imagen -->
            <v-row v-if="productForm.imagen">
              <v-col cols="12">
                <v-divider class="my-2" />
                <div class="text-subtitle-2 mb-2">Previsualización:</div>
                <v-img
                  :src="productForm.imagen"
                  height="150"
                  width="200"
                  cover
                  class="rounded-xl"
                  style="object-fit: cover"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="productDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" :disabled="!formValid" @click="saveProduct">
            {{ dialogMode === 'create' ? 'Crear producto' : 'Guardar cambios' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Categorías -->
    <v-dialog v-model="categoryDialog" max-width="600">
      <v-card rounded="xl">
        <v-card-title class="pa-4 bg-primary text-white">
          Gestionar categorías
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            class="float-right"
            @click="categoryDialog = false"
          />
        </v-card-title>

        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12">
              <div class="d-flex gap-2 mb-4">
                <v-text-field
                  v-model="newCategory.nombre"
                  label="Nueva categoría"
                  variant="outlined"
                  density="comfortable"
                  class="flex-grow-1"
                />
                <v-select
                  v-model="newCategory.icono"
                  :items="iconOptions"
                  label="Icono"
                  variant="outlined"
                  density="comfortable"
                  style="width: 100px"
                />
                <v-btn color="primary" @click="addCategory" :disabled="!newCategory.nombre">
                  <v-icon icon="mdi-plus" />
                </v-btn>
              </div>
            </v-col>

            <v-col cols="12">
              <v-list>
                <v-list-item v-for="cat in categories" :key="cat.id">
                  <template v-slot:prepend>
                    <v-icon :icon="cat.icono || 'mdi-food'" class="mr-2" />
                  </template>
                  <v-list-item-title>{{ cat.nombre }}</v-list-item-title>
                  <template v-slot:append>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="error"
                      @click="deleteCategory(cat)"
                    >
                      <v-icon icon="mdi-delete" size="small" />
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmación eliminar -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">¿Eliminar producto?</v-card-title>
        <v-card-text>
          ¿Estás seguro de eliminar <strong>{{ productToDelete?.nombre }}</strong
          >? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteProduct">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'

const authStore = useAuthStore()

// Estado
const loading = ref(false)
const saving = ref(false)
const products = ref([])
const categories = ref([])
const activeCategory = ref('todos')
const productDialog = ref(false)
const categoryDialog = ref(false)
const deleteDialog = ref(false)
const dialogMode = ref('create')
const formValid = ref(false)
const productToDelete = ref(null)

// Formularios
const productForm = ref({
  nombre: '',
  precio: '',
  descripcion: '',
  categoria: '',
  imagen: '',
  destacado: false,
  disponible: true,
})

const newCategory = ref({
  nombre: '',
  icono: 'mdi-food',
})

// Opciones de iconos
const iconOptions = [
  { title: '🍕 Comida', value: 'mdi-food' },
  { title: '🥤 Bebida', value: 'mdi-drink' },
  { title: '🍰 Postre', value: 'mdi-cake' },
  { title: '🍺 Cerveza', value: 'mdi-beer' },
  { title: '🍷 Vino', value: 'mdi-wine' },
  { title: '🥗 Ensalada', value: 'mdi-food-variant' },
  { title: '🍔 Hamburguesa', value: 'mdi-hamburger' },
  { title: '☕ Café', value: 'mdi-coffee' },
]

// Reglas de validación
const rules = {
  required: (v) => !!v || 'Campo requerido',
  number: (v) => !isNaN(parseFloat(v)) || 'Debe ser un número válido',
}

// Computed
const totalProductos = computed(() => products.value.length)
const productosActivos = computed(() => products.value.filter((p) => p.disponible).length)
const productosInactivos = computed(() => products.value.filter((p) => !p.disponible).length)

const filteredProducts = computed(() => {
  if (activeCategory.value === 'todos') {
    return products.value
  }
  return products.value.filter((p) => p.categoria === activeCategory.value)
})

// Suscripción en tiempo real a productos
let unsubscribeProducts = null

const loadProducts = () => {
  const productsRef = collection(db, 'tenants', authStore.tenantId, 'menu')
  const q = query(productsRef, orderBy('createdAt', 'desc'))

  unsubscribeProducts = onSnapshot(q, (snapshot) => {
    products.value = snapshot.docs.map((doc) => {
      const data = doc.data()
      // Encontrar nombre de categoría
      const categoria = categories.value.find((c) => c.id === data.categoria)
      return {
        id: doc.id,
        ...data,
        categoriaNombre: categoria?.nombre || data.categoria,
      }
    })
  })
}

const loadCategories = async () => {
  const categoriesRef = collection(db, 'tenants', authStore.tenantId, 'categorias')
  const snapshot = await getDocs(categoriesRef)
  categories.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  // Si no hay categorías, crear algunas por defecto
  if (categories.value.length === 0) {
    const defaultCategories = [
      { nombre: 'Entradas', icono: 'mdi-food-variant' },
      { nombre: 'Platos Principales', icono: 'mdi-food' },
      { nombre: 'Postres', icono: 'mdi-cake' },
      { nombre: 'Bebidas', icono: 'mdi-drink' },
      { nombre: 'Cócteles', icono: 'mdi-glass-cocktail' },
    ]

    for (const cat of defaultCategories) {
      await addDoc(collection(db, 'tenants', authStore.tenantId, 'categorias'), {
        ...cat,
        createdAt: new Date(),
      })
    }
    await loadCategories()
  }
}

const openProductDialog = (mode, product = null) => {
  dialogMode.value = mode

  if (mode === 'create') {
    productForm.value = {
      nombre: '',
      precio: '',
      descripcion: '',
      categoria: categories.value[0]?.id || '',
      imagen: '',
      destacado: false,
      disponible: true,
    }
  } else if (product) {
    productForm.value = {
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      descripcion: product.descripcion || '',
      categoria: product.categoria,
      imagen: product.imagen || '',
      destacado: product.destacado || false,
      disponible: product.disponible,
    }
  }

  productDialog.value = true
}

const saveProduct = async () => {
  saving.value = true

  try {
    const data = {
      nombre: productForm.value.nombre,
      precio: parseFloat(productForm.value.precio),
      descripcion: productForm.value.descripcion,
      categoria: productForm.value.categoria,
      imagen: productForm.value.imagen,
      destacado: productForm.value.destacado,
      disponible: productForm.value.disponible,
      updatedAt: new Date(),
    }

    if (dialogMode.value === 'create') {
      await addDoc(collection(db, 'tenants', authStore.tenantId, 'menu'), {
        ...data,
        createdAt: new Date(),
      })
    } else {
      await updateDoc(doc(db, 'tenants', authStore.tenantId, 'menu', productForm.value.id), data)
    }

    productDialog.value = false
  } catch (error) {
    console.error(error)
    alert('Error al guardar el producto')
  } finally {
    saving.value = false
  }
}

const toggleDisponible = async (product) => {
  await updateDoc(doc(db, 'tenants', authStore.tenantId, 'menu', product.id), {
    disponible: !product.disponible,
  })
}

const confirmDelete = (product) => {
  productToDelete.value = product
  deleteDialog.value = true
}

const deleteProduct = async () => {
  if (productToDelete.value) {
    await deleteDoc(doc(db, 'tenants', authStore.tenantId, 'menu', productToDelete.value.id))
    deleteDialog.value = false
    productToDelete.value = null
  }
}

const addCategory = async () => {
  if (newCategory.value.nombre) {
    await addDoc(collection(db, 'tenants', authStore.tenantId, 'categorias'), {
      nombre: newCategory.value.nombre,
      icono: newCategory.value.icono,
      createdAt: new Date(),
    })
    newCategory.value = { nombre: '', icono: 'mdi-food' }
    await loadCategories()
  }
}

const deleteCategory = async (category) => {
  if (confirm(`¿Eliminar categoría "${category.nombre}"?`)) {
    // Verificar si hay productos en esta categoría
    const productsInCat = products.value.filter((p) => p.categoria === category.id)
    if (productsInCat.length > 0) {
      alert(
        `No se puede eliminar ${category.nombre} porque tiene ${productsInCat.length} productos.`,
      )
      return
    }
    await deleteDoc(doc(db, 'tenants', authStore.tenantId, 'categorias', category.id))
    await loadCategories()
  }
}

const importMenu = () => {
  // Crear input file para importar CSV/JSON
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json,.csv'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    const text = await file.text()
    // Parsear y guardar productos
    try {
      const imported = JSON.parse(text)
      for (const product of imported) {
        await addDoc(collection(db, 'tenants', authStore.tenantId, 'menu'), {
          ...product,
          createdAt: new Date(),
        })
      }
      alert('Menú importado exitosamente')
    } catch (error) {
      alert('Error al importar: ' + error.message)
    }
  }
  input.click()
}

onMounted(() => {
  loadCategories()
  loadProducts()
})

onUnmounted(() => {
  if (unsubscribeProducts) unsubscribeProducts()
})
</script>

<style scoped>
.product-card {
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12) !important;
}

.position-absolute {
  position: absolute;
}

.bottom-right {
  bottom: 12px;
  right: 12px;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.gap-4 {
  gap: 16px;
}

.gap-2 {
  gap: 8px;
}
</style>
