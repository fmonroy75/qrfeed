<!-- src/views/super-admin/Restaurantes.vue -->
<template>
  <div>
    <!-- Header con botón nuevo -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <span class="text-h5 font-weight-bold">Restaurantes</span>
            <span class="text-caption text-grey ml-2">Gestiona todos los restaurantes</span>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
            Nuevo restaurante
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-text-field
          v-model="filters.search"
          label="Buscar"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-select
          v-model="filters.plan"
          :items="planOptions"
          label="Plan"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-select
          v-model="filters.status"
          :items="statusOptions"
          label="Estado"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-col>
    </v-row>

    <!-- Tabla de restaurantes -->
    <v-card rounded="xl" elevation="2">
      <v-data-table
        :headers="headers"
        :items="filteredRestaurants"
        :loading="loading"
        :search="filters.search"
        items-per-page="10"
        class="elevation-0"
      >
        <template v-slot:item.status="{ item }">
          <v-chip :color="item.status === 'active' ? 'success' : 'error'" size="small">
            {{ item.status === 'active' ? 'Activo' : 'Suspendido' }}
          </v-chip>
        </template>

        <template v-slot:item.plan="{ item }">
          <v-chip :color="planColors[item.plan]" size="small">
            {{ item.plan }}
          </v-chip>
        </template>

        <template v-slot:item.fechaVencimiento="{ item }">
          {{ formatDate(item.fechaVencimiento) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon variant="text" size="small" color="primary" @click="openEditDialog(item)">
            <v-icon icon="mdi-pencil" size="small" />
          </v-btn>
          <v-btn icon variant="text" size="small" color="info" @click="viewRestaurant(item)">
            <v-icon icon="mdi-eye" size="small" />
          </v-btn>
          <v-btn icon variant="text" size="small" color="error" @click="confirmDelete(item)">
            <v-icon icon="mdi-delete" size="small" />
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog para crear/editar restaurante -->
    <v-dialog v-model="dialog" max-width="800">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-4 bg-primary text-white">
          {{ dialogMode === 'create' ? 'Nuevo restaurante' : 'Editar restaurante' }}
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="formRef" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.nombre"
                  label="Nombre del restaurante *"
                  :rules="[rules.required]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.slug"
                  label="Slug (URL única) *"
                  :rules="[rules.required, rules.slug]"
                  variant="outlined"
                  hint="Ej: la-buena-mesa"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.email"
                  label="Email del dueño *"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="formData.telefono" label="Teléfono" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="formData.plan" :items="plans" label="Plan" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.status"
                  :items="statuses"
                  label="Estado"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.dominioPersonalizado"
                  label="Dominio personalizado (opcional)"
                  variant="outlined"
                  hint="Ej: menu.labuenamesa.cl"
                />
              </v-col>
              <v-col cols="12">
                <v-alert type="info" variant="tonal">
                  <strong>URL del restaurante:</strong><br />
                  <code>https://qrfeed.ib.com/rest/{{ formData.slug || 'slug' }}</code>
                </v-alert>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveRestaurant" :disabled="!formValid">
            {{ dialogMode === 'create' ? 'Crear restaurante' : 'Guardar cambios' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmación eliminar -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">¿Eliminar restaurante?</v-card-title>
        <v-card-text>
          Esta acción eliminará todos los datos del restaurante
          <strong>{{ restaurantToDelete?.nombre }}</strong
          >. No se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteRestaurant">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db, auth } from '@/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import moment from 'moment'

const loading = ref(false)
const restaurants = ref([])
const dialog = ref(false)
const deleteDialog = ref(false)
const dialogMode = ref('create')
const formValid = ref(false)
const saving = ref(false)
const restaurantToDelete = ref(null)

const filters = ref({
  search: '',
  plan: 'todos',
  status: 'todos',
})

const headers = [
  { title: 'Restaurante', key: 'nombre', sortable: true },
  { title: 'Email', key: 'email' },
  { title: 'Plan', key: 'plan', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Vence', key: 'fechaVencimiento', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
]

const plans = ['basico', 'pro', 'premium']
const statuses = ['active', 'suspended', 'trial']
const planOptions = ['todos', 'basico', 'pro', 'premium']
const statusOptions = ['todos', 'active', 'suspended', 'trial']

const planColors = {
  basico: 'success',
  pro: 'primary',
  premium: 'accent',
}

const formData = ref({
  nombre: '',
  slug: '',
  email: '',
  telefono: '',
  plan: 'basico',
  status: 'active',
  dominioPersonalizado: '',
})

const rules = {
  required: (v) => !!v || 'Campo requerido',
  email: (v) => /.+@.+\..+/.test(v) || 'Email inválido',
  slug: (v) => /^[a-z0-9-]+$/.test(v) || 'Solo minúsculas, números y guiones',
}

const filteredRestaurants = computed(() => {
  let filtered = restaurants.value

  if (filters.value.plan !== 'todos') {
    filtered = filtered.filter((r) => r.plan === filters.value.plan)
  }
  if (filters.value.status !== 'todos') {
    filtered = filtered.filter((r) => r.status === filters.value.status)
  }
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(
      (r) => r.nombre.toLowerCase().includes(search) || r.email.toLowerCase().includes(search),
    )
  }

  return filtered
})

const formatDate = (date) => {
  return date?.toDate ? moment(date.toDate()).format('DD/MM/YYYY') : '-'
}

const loadRestaurants = async () => {
  loading.value = true
  const snapshot = await getDocs(collection(db, 'tenants'))
  restaurants.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  loading.value = false
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  formData.value = {
    nombre: '',
    slug: '',
    email: '',
    telefono: '',
    plan: 'basico',
    status: 'active',
    dominioPersonalizado: '',
  }
  dialog.value = true
}

const openEditDialog = (restaurant) => {
  dialogMode.value = 'edit'
  formData.value = { ...restaurant }
  dialog.value = true
}

const saveRestaurant = async () => {
  saving.value = true

  try {
    if (dialogMode.value === 'create') {
      // Crear tenant
      const tenantRef = await addDoc(collection(db, 'tenants'), {
        nombre: formData.value.nombre,
        email: formData.value.email,
        telefono: formData.value.telefono,
        slug: formData.value.slug,
        plan: formData.value.plan,
        status: formData.value.status,
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      })

      // Crear slugIndex
      await setDoc(doc(db, 'slugIndex', formData.value.slug), {
        tenantId: tenantRef.id,
        slug: formData.value.slug,
      })

      // Crear dominio personalizado si existe
      if (formData.value.dominioPersonalizado) {
        await setDoc(doc(db, 'dominios', formData.value.dominioPersonalizado), {
          tenantId: tenantRef.id,
          tipo: 'personalizado',
          status: 'pending',
          createdAt: new Date(),
        })
      }

      // Crear usuario admin
      const password = Math.random().toString(36).slice(-8)
      const userCred = await createUserWithEmailAndPassword(auth, formData.value.email, password)

      await setDoc(doc(db, 'usuarios_restaurant', userCred.user.uid), {
        email: formData.value.email,
        tenantId: tenantRef.id,
        rol: 'admin',
        activo: true,
      })

      alert(`✅ Restaurante creado!\n\nContraseña temporal: ${password}`)
    } else {
      // Actualizar tenant
      await updateDoc(doc(db, 'tenants', formData.value.id), {
        nombre: formData.value.nombre,
        email: formData.value.email,
        telefono: formData.value.telefono,
        plan: formData.value.plan,
        status: formData.value.status,
      })

      alert('✅ Restaurante actualizado!')
    }

    dialog.value = false
    loadRestaurants()
  } catch (error) {
    console.error(error)
    alert('Error: ' + error.message)
  } finally {
    saving.value = false
  }
}

const confirmDelete = (restaurant) => {
  restaurantToDelete.value = restaurant
  deleteDialog.value = true
}

const deleteRestaurant = async () => {
  await deleteDoc(doc(db, 'tenants', restaurantToDelete.value.id))
  deleteDialog.value = false
  loadRestaurants()
}

const viewRestaurant = (restaurant) => {
  window.open(`https://qrfeed.ib.com/rest/${restaurant.slug}`, '_blank')
}

onMounted(() => {
  loadRestaurants()
})
</script>
