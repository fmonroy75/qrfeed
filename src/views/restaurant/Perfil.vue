<!-- src/views/restaurant/Perfil.vue -->
<template>
  <div>
    <v-row>
      <v-col cols="12" md="4">
        <!-- Tarjeta de perfil -->
        <v-card rounded="xl" elevation="2" class="text-center pa-6">
          <v-avatar size="100" :color="avatarColor" class="mb-4">
            <v-icon :icon="avatarIcon" size="48" color="white" />
          </v-avatar>

          <div class="text-h5 font-weight-bold">
            {{ perfil.nombre || perfil.email?.split('@')[0] }}
          </div>
          <div class="text-body-2 text-grey mb-2">{{ perfil.email }}</div>

          <v-chip :color="rolColors[perfil.rol]" size="small" class="mb-4">
            <v-icon :icon="rolIcons[perfil.rol]" size="small" class="mr-1" />
            {{ rolLabels[perfil.rol] }}
          </v-chip>

          <v-divider class="my-4" />

          <div class="text-left">
            <div class="d-flex align-center mb-3">
              <v-icon icon="mdi-store" size="small" class="mr-2 text-grey" />
              <span class="text-caption">Restaurante: {{ restaurante?.nombre }}</span>
            </div>
            <div class="d-flex align-center mb-3">
              <v-icon icon="mdi-clock-outline" size="small" class="mr-2 text-grey" />
              <span class="text-caption">Miembro desde: {{ formatFecha(perfil.createdAt) }}</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <!-- Formulario de edición -->
        <v-card rounded="xl" elevation="2" class="pa-6">
          <div class="text-h6 font-weight-bold mb-4">Editar perfil</div>

          <v-form ref="formRef" v-model="formValid">
            <v-text-field
              v-model="profileForm.nombre"
              label="Nombre completo"
              variant="outlined"
              density="comfortable"
            />

            <v-text-field
              v-model="profileForm.email"
              label="Correo electrónico"
              type="email"
              disabled
              variant="outlined"
              density="comfortable"
            />

            <v-text-field
              v-model="profileForm.password"
              label="Nueva contraseña"
              type="password"
              variant="outlined"
              density="comfortable"
              hint="Dejar en blanco para no cambiar"
            />

            <v-text-field
              v-model="profileForm.confirmPassword"
              label="Confirmar contraseña"
              type="password"
              variant="outlined"
              density="comfortable"
              :rules="[passwordMatch]"
              v-if="profileForm.password"
            />

            <v-btn
              color="primary"
              :loading="saving"
              :disabled="!formValid"
              @click="saveProfile"
              class="mt-2"
            >
              Guardar cambios
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db, auth } from '@/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { updatePassword, updateEmail } from 'firebase/auth'
import moment from 'moment'

const authStore = useAuthStore()

const perfil = ref({})
const restaurante = ref({})
const saving = ref(false)
const formValid = ref(false)

const profileForm = ref({
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
})

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

const avatarColor = computed(() => {
  const colors = {
    admin: '#4361EE',
    mesero: '#10B981',
    cocina: '#F59E0B',
  }
  return colors[perfil.value.rol] || '#6B7280'
})

const avatarIcon = computed(() => {
  const icons = {
    admin: 'mdi-account-crown',
    mesero: 'mdi-waiter',
    cocina: 'mdi-chef-hat',
  }
  return icons[perfil.value.rol] || 'mdi-account'
})

const passwordMatch = () => {
  return (
    profileForm.value.password === profileForm.value.confirmPassword ||
    'Las contraseñas no coinciden'
  )
}

const loadPerfil = async () => {
  // Cargar datos del empleado
  const userDoc = await getDoc(doc(db, 'usuarios_restaurant', authStore.user.uid))
  if (userDoc.exists()) {
    perfil.value = { id: userDoc.id, ...userDoc.data() }
    profileForm.value.nombre = perfil.value.nombre || ''
    profileForm.value.email = perfil.value.email || authStore.user.email
  }

  // Cargar datos del restaurante
  if (authStore.tenantId) {
    const restDoc = await getDoc(doc(db, 'tenants', authStore.tenantId))
    if (restDoc.exists()) {
      restaurante.value = { id: restDoc.id, ...restDoc.data() }
    }
  }
}

const saveProfile = async () => {
  saving.value = true

  try {
    // Actualizar nombre en Firestore
    if (profileForm.value.nombre !== perfil.value.nombre) {
      await updateDoc(doc(db, 'usuarios_restaurant', authStore.user.uid), {
        nombre: profileForm.value.nombre,
        updatedAt: new Date(),
      })
    }

    // Actualizar contraseña en Firebase Auth
    if (profileForm.value.password) {
      await updatePassword(authStore.user, profileForm.value.password)
    }

    alert('✅ Perfil actualizado correctamente')
    profileForm.value.password = ''
    profileForm.value.confirmPassword = ''
    loadPerfil()
  } catch (error) {
    console.error(error)
    alert('Error: ' + error.message)
  } finally {
    saving.value = false
  }
}

const formatFecha = (timestamp) => {
  if (!timestamp) return '-'
  return timestamp?.toDate ? moment(timestamp.toDate()).format('DD/MM/YYYY') : '-'
}

onMounted(() => {
  loadPerfil()
})
</script>
