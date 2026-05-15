<!-- src/views/restaurant/Empleados.vue -->
<template>
  <div>
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center flex-wrap gap-3">
          <div>
            <span class="text-h5 font-weight-bold">Empleados</span>
            <span class="text-caption text-grey ml-2">Gestiona el personal del restaurante</span>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openEmployeeDialog('create')">
            Invitar empleado
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card rounded="xl" elevation="2" class="pa-4">
          <div class="d-flex align-center">
            <v-avatar color="primary-lighten-4" size="48" class="mr-3">
              <v-icon icon="mdi-account-group" color="primary" />
            </v-avatar>
            <div>
              <div class="text-caption text-grey">Total empleados</div>
              <div class="text-h5 font-weight-bold">{{ totalEmpleados }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card rounded="xl" elevation="2" class="pa-4">
          <div class="d-flex align-center">
            <v-avatar color="success-lighten-4" size="48" class="mr-3">
              <v-icon icon="mdi-account-crown" color="success" />
            </v-avatar>
            <div>
              <div class="text-caption text-grey">Administradores</div>
              <div class="text-h5 font-weight-bold">{{ empleadosPorRol.admin }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card rounded="xl" elevation="2" class="pa-4">
          <div class="d-flex align-center">
            <v-avatar color="info-lighten-4" size="48" class="mr-3">
              <v-icon icon="mdi-waiter" color="info" />
            </v-avatar>
            <div>
              <div class="text-caption text-grey">Meseros</div>
              <div class="text-h5 font-weight-bold">{{ empleadosPorRol.mesero }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card rounded="xl" elevation="2" class="pa-4">
          <div class="d-flex align-center">
            <v-avatar color="warning-lighten-4" size="48" class="mr-3">
              <v-icon icon="mdi-chef-hat" color="warning" />
            </v-avatar>
            <div>
              <div class="text-caption text-grey">Cocina</div>
              <div class="text-h5 font-weight-bold">{{ empleadosPorRol.cocina }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de empleados -->
    <v-card rounded="xl" elevation="2">
      <v-data-table
        :headers="headers"
        :items="filteredEmpleados"
        :loading="loading"
        :search="search"
        items-per-page="10"
        class="elevation-0"
      >
        <template v-slot:top>
          <div class="pa-4 d-flex justify-space-between align-center">
            <v-text-field
              v-model="search"
              label="Buscar empleado"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              class="flex-grow-1 mr-4"
            />
            <v-select
              v-model="rolFilter"
              :items="rolOptions"
              label="Filtrar por rol"
              variant="outlined"
              density="compact"
              hide-details
              style="width: 180px"
            />
          </div>
        </template>

        <template v-slot:[`item.nombre`]="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="36" :color="getAvatarColor(item)" class="mr-3">
              <v-icon :icon="getAvatarIcon(item)" size="20" color="white" />
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.nombre || item.email?.split('@')[0] }}</div>
              <div class="text-caption text-grey">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <template v-slot:[`item.rol`]="{ item }">
          <v-chip :color="rolColors[item.rol]" size="small">
            <v-icon :icon="rolIcons[item.rol]" size="small" class="mr-1" />
            {{ rolLabels[item.rol] }}
          </v-chip>
        </template>

        <template v-slot:[`item.activo`]="{ item }">
          <v-chip :color="item.activo ? 'success' : 'error'" size="small">
            {{ item.activo ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <template v-slot:[`item.ultimoAcceso`]="{ item }">
          {{ formatFecha(item.ultimoAcceso) }}
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            icon
            variant="text"
            size="small"
            color="primary"
            @click="openEmployeeDialog('edit', item)"
          >
            <v-icon icon="mdi-pencil" size="small" />
          </v-btn>
          <v-btn
            icon
            variant="text"
            size="small"
            :color="item.activo ? 'warning' : 'success'"
            @click="toggleActivo(item)"
          >
            <v-icon :icon="item.activo ? 'mdi-account-off' : 'mdi-account-check'" size="small" />
          </v-btn>
          <v-btn icon variant="text" size="small" color="error" @click="confirmDelete(item)">
            <v-icon icon="mdi-delete" size="small" />
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog para crear/editar empleado -->
    <v-dialog v-model="employeeDialog" max-width="600">
      <v-card rounded="xl">
        <v-card-title class="pa-4 bg-primary text-white">
          {{ dialogMode === 'create' ? 'Invitar empleado' : 'Editar empleado' }}
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            class="float-right"
            @click="employeeDialog = false"
          />
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="formRef" v-model="formValid">
            <v-text-field
              v-model="employeeForm.nombre"
              label="Nombre completo"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
            />

            <v-text-field
              v-model="employeeForm.email"
              label="Correo electrónico"
              type="email"
              :rules="[rules.required, rules.email]"
              variant="outlined"
              density="comfortable"
            />

            <v-select
              v-model="employeeForm.rol"
              :items="rolOptionsEmployees"
              label="Rol"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-icon :icon="rolIcons[item.value]" class="mr-2" />
                  </template>
                </v-list-item>
              </template>
            </v-select>

            <v-text-field
              v-if="dialogMode === 'create'"
              v-model="employeeForm.password"
              label="Contraseña temporal"
              :rules="[rules.required, rules.passwordLength]"
              variant="outlined"
              density="comfortable"
              hint="Mínimo 6 caracteres"
            />

            <v-alert type="info" variant="tonal" class="mt-4">
              <div class="d-flex align-center">
                <v-icon icon="mdi-email-outline" class="mr-2" />
                <div>
                  <strong>Invitación por email</strong><br />
                  <span class="text-caption"
                    >El empleado recibirá un email con sus credenciales de acceso</span
                  >
                </div>
              </div>
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="employeeDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" :disabled="!formValid" @click="saveEmployee">
            {{ dialogMode === 'create' ? 'Enviar invitación' : 'Guardar cambios' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmación eliminar -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">¿Eliminar empleado?</v-card-title>
        <v-card-text>
          ¿Estás seguro de eliminar a
          <strong>{{ employeeToDelete?.nombre || employeeToDelete?.email }}</strong
          >? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteEmployee">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db, auth } from '@/firebase'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { initializeApp, deleteApp } from 'firebase/app'
import moment from 'moment'

const authStore = useAuthStore()

// Estado
const loading = ref(false)
const saving = ref(false)
const employees = ref([])
const search = ref('')
const rolFilter = ref('todos')
const employeeDialog = ref(false)
const deleteDialog = ref(false)
const dialogMode = ref('create')
const formValid = ref(false)
const employeeToDelete = ref(null)

// Formulario
const employeeForm = ref({
  nombre: '',
  email: '',
  rol: 'mesero',
  password: '',
})

// Headers tabla
const headers = [
  { title: 'Empleado', key: 'nombre', sortable: true },
  { title: 'Rol', key: 'rol', sortable: true },
  { title: 'Estado', key: 'activo', sortable: true },
  { title: 'Último acceso', key: 'ultimoAcceso', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
]

// Opciones de roles
const rolOptions = ['todos', 'admin', 'mesero', 'cocina']
const rolOptionsEmployees = [
  { title: 'Administrador', value: 'admin' },
  { title: 'Mesero', value: 'mesero' },
  { title: 'Cocina', value: 'cocina' },
]

const rolLabels = {
  admin: 'Administrador',
  mesero: 'Mesero',
  cocina: 'Cocina',
}

const rolColors = {
  admin: 'primary',
  mesero: 'info',
  cocina: 'warning',
}

const rolIcons = {
  admin: 'mdi-account-crown',
  mesero: 'mdi-waiter',
  cocina: 'mdi-chef-hat',
}

// Reglas validación
const rules = {
  required: (v) => !!v || 'Campo requerido',
  email: (v) => /.+@.+\..+/.test(v) || 'Email inválido',
  passwordLength: (v) => !v || v.length >= 6 || 'Mínimo 6 caracteres',
}

// Computed
const totalEmpleados = computed(() => employees.value.length)

const empleadosPorRol = computed(() => {
  return {
    admin: employees.value.filter((e) => e.rol === 'admin').length,
    mesero: employees.value.filter((e) => e.rol === 'mesero').length,
    cocina: employees.value.filter((e) => e.rol === 'cocina').length,
  }
})

const filteredEmpleados = computed(() => {
  let filtered = employees.value

  if (rolFilter.value !== 'todos') {
    filtered = filtered.filter((e) => e.rol === rolFilter.value)
  }

  if (search.value) {
    const term = search.value.toLowerCase()
    filtered = filtered.filter(
      (e) => e.email?.toLowerCase().includes(term) || e.nombre?.toLowerCase().includes(term),
    )
  }

  return filtered
})

// Suscripción en tiempo real
let unsubscribeEmployees = null

const loadEmployees = () => {
  const employeesRef = collection(db, 'usuarios_restaurant')
  const q = query(employeesRef, where('tenantId', '==', authStore.tenantId))

  unsubscribeEmployees = onSnapshot(q, async (snapshot) => {
    const empleados = []

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()

      // Obtener último acceso desde Firebase Auth (requiere función adicional)
      // Por ahora usamos datos mock
      empleados.push({
        id: docSnap.id,
        ...data,
        ultimoAcceso: data.ultimoAcceso || null,
      })
    }

    employees.value = empleados
  })
}

const getAvatarColor = (employee) => {
  const colors = {
    admin: '#4361EE',
    mesero: '#10B981',
    cocina: '#F59E0B',
  }
  return colors[employee.rol] || '#6B7280'
}

const getAvatarIcon = (employee) => {
  const icons = {
    admin: 'mdi-account-crown',
    mesero: 'mdi-waiter',
    cocina: 'mdi-chef-hat',
  }
  return icons[employee.rol] || 'mdi-account'
}

const openEmployeeDialog = (mode, employee = null) => {
  dialogMode.value = mode

  if (mode === 'create') {
    employeeForm.value = {
      nombre: '',
      email: '',
      rol: 'mesero',
      password: Math.random().toString(36).slice(-8),
    }
  } else if (employee) {
    employeeForm.value = {
      id: employee.id,
      nombre: employee.nombre || '',
      email: employee.email,
      rol: employee.rol,
      activo: employee.activo,
    }
  }

  employeeDialog.value = true
}

const saveEmployee = async () => {
  saving.value = true

  try {
    if (dialogMode.value === 'create') {
      // Crear usuario en Firebase Auth usando App Secundaria
      const secondaryApp = initializeApp(auth.app.options, 'EmployeeApp')
      const secondaryAuth = getAuth(secondaryApp)
      
      const userCred = await createUserWithEmailAndPassword(
        secondaryAuth,
        employeeForm.value.email,
        employeeForm.value.password,
      )
      
      await deleteApp(secondaryApp)

      // Crear documento en Firestore
      await addDoc(collection(db, 'usuarios_restaurant'), {
        uid: userCred.user.uid,
        nombre: employeeForm.value.nombre,
        email: employeeForm.value.email,
        rol: employeeForm.value.rol,
        tenantId: authStore.tenantId,
        activo: true,
        createdAt: new Date(),
      })

      // Enviar email con credenciales (opcional - se puede hacer con Cloud Function)
      alert(
        `✅ Empleado invitado!\n\nEmail: ${employeeForm.value.email}\nContraseña: ${employeeForm.value.password}`,
      )
    } else {
      // Actualizar empleado
      await updateDoc(doc(db, 'usuarios_restaurant', employeeForm.value.id), {
        nombre: employeeForm.value.nombre,
        rol: employeeForm.value.rol,
        updatedAt: new Date(),
      })

      alert('✅ Empleado actualizado')
    }

    employeeDialog.value = false
  } catch (error) {
    console.error(error)
    alert('Error: ' + error.message)
  } finally {
    saving.value = false
  }
}

const toggleActivo = async (employee) => {
  await updateDoc(doc(db, 'usuarios_restaurant', employee.id), {
    activo: !employee.activo,
    updatedAt: new Date(),
  })
}

const confirmDelete = (employee) => {
  employeeToDelete.value = employee
  deleteDialog.value = true
}

const deleteEmployee = async () => {
  if (employeeToDelete.value) {
    await deleteDoc(doc(db, 'usuarios_restaurant', employeeToDelete.value.id))
    deleteDialog.value = false
    employeeToDelete.value = null
  }
}

const formatFecha = (timestamp) => {
  if (!timestamp) return 'Nunca'
  return timestamp?.toDate ? moment(timestamp.toDate()).format('DD/MM/YYYY HH:mm') : '-'
}

onMounted(() => {
  loadEmployees()
})

onUnmounted(() => {
  if (unsubscribeEmployees) unsubscribeEmployees()
})
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}

.primary-lighten-4 {
  background-color: rgba(67, 97, 238, 0.1);
}

.success-lighten-4 {
  background-color: rgba(76, 175, 80, 0.1);
}

.info-lighten-4 {
  background-color: rgba(33, 150, 243, 0.1);
}

.warning-lighten-4 {
  background-color: rgba(255, 193, 7, 0.1);
}
</style>
