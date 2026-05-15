<!-- src/views/super-admin/Solicitudes.vue -->
<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <span class="text-h5 font-weight-bold">Solicitudes de Registro</span>
            <span class="text-caption text-grey ml-2">Aprueba nuevos restaurantes</span>
          </div>
          <v-btn color="primary" prepend-icon="mdi-refresh" @click="loadSolicitudes">
            Actualizar
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="2">
      <v-data-table
        :headers="headers"
        :items="solicitudes"
        :loading="loading"
        class="elevation-0"
      >
        <template v-slot:[`item.solicitudRestaurante.fechaSolicitud`]="{ item }">
          {{ formatFecha(item.solicitudRestaurante?.fechaSolicitud) }}
        </template>
        
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            color="success"
            size="small"
            variant="tonal"
            prepend-icon="mdi-check"
            @click="aprobarSolicitud(item)"
            :loading="aprobarLoading === item.id"
          >
            Aprobar
          </v-btn>
          <v-btn
            color="error"
            size="small"
            variant="text"
            icon="mdi-close"
            class="ml-2"
            @click="rechazarSolicitud(item)"
          />
        </template>

        <template #no-data>
          <div class="pa-4 text-center text-grey">
            <v-icon icon="mdi-inbox-outline" size="48" class="mb-2" />
            <div>No hay solicitudes pendientes</div>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, query, where, getDocs, addDoc, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import moment from 'moment'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const aprobarLoading = ref(null)
const solicitudes = ref([])

const headers = [
  { title: 'Fecha', key: 'solicitudRestaurante.fechaSolicitud', sortable: true },
  { title: 'Email Contacto', key: 'email', sortable: true },
  { title: 'Nombre Restaurante', key: 'solicitudRestaurante.nombre', sortable: true },
  { title: 'Slug Propuesto', key: 'solicitudRestaurante.slug', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' }
]

const loadSolicitudes = async () => {
  // DEBUG DE SEGURIDAD
  const currentEmail = authStore.user?.email
  const envEmail = import.meta.env.VITE_SUPER_ADMIN_EMAIL
  
  if (currentEmail !== envEmail && currentEmail !== 'admin@ib.com') {
    alert(`⚠️ ATENCIÓN: Estás conectado con el correo "${currentEmail}". \n\nLas reglas de Firebase en la nube no leen el archivo .env. Solo leen lo que está en la Consola de Firebase.\n\nDebes ir a tu Firebase Console -> Firestore -> Reglas, y cambiar el correo a "${currentEmail}" en la función isSuperAdmin() para que Firebase te deje descargar las solicitudes.`)
  }

  loading.value = true
  try {
    const q = query(collection(db, 'usuarios_restaurant'), where('rol', '==', 'pending'))
    const snapshot = await getDocs(q)
    solicitudes.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    // Sort by date desc manually if indexing on multiple fields isn't ready
    solicitudes.value.sort((a, b) => b.solicitudRestaurante?.fechaSolicitud - a.solicitudRestaurante?.fechaSolicitud)
  } catch (error) {
    console.error("Error al cargar solicitudes:", error)
  } finally {
    loading.value = false
  }
}

const aprobarSolicitud = async (solicitud) => {
  if (!confirm(`¿Aprobar y crear restaurante "${solicitud.solicitudRestaurante.nombre}"?`)) return
  
  aprobarLoading.value = solicitud.id
  try {
    const restData = solicitud.solicitudRestaurante
    
    // 1. Crear el tenant en la colección 'tenants'
    const tenantRef = await addDoc(collection(db, 'tenants'), {
      nombre: restData.nombre,
      email: solicitud.email,
      slug: restData.slug,
      plan: 'trial',
      status: 'active',
      fechaVencimiento: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días
      createdAt: new Date(),
    })

    // 2. Crear el índice para el slug
    await setDoc(doc(db, 'slugIndex', restData.slug), {
      tenantId: tenantRef.id,
      slug: restData.slug,
    })

    // 3. Actualizar el usuario a admin
    await updateDoc(doc(db, 'usuarios_restaurant', solicitud.id), {
      rol: 'admin',
      tenantId: tenantRef.id,
      solicitudRestaurante: null // Limpiar los datos de solicitud
    })

    alert(`✅ Restaurante creado. El usuario ya puede iniciar sesión.`)
    await loadSolicitudes()
    
  } catch (error) {
    console.error(error)
    alert("Error al aprobar: " + error.message)
  } finally {
    aprobarLoading.value = null
  }
}

const rechazarSolicitud = async (solicitud) => {
  if (!confirm(`¿Estás seguro de rechazar y ELIMINAR la solicitud de ${solicitud.email}?`)) return
  
  try {
    // Si se rechaza, idealmente también habría que borrarlo de Firebase Auth
    // Pero requeriría Cloud Functions o un SDK Admin. Por ahora borramos el doc de Firestore.
    await deleteDoc(doc(db, 'usuarios_restaurant', solicitud.id))
    alert('Solicitud rechazada y eliminada.')
    await loadSolicitudes()
  } catch (error) {
    console.error(error)
    alert("Error al rechazar: " + error.message)
  }
}

const formatFecha = (timestamp) => {
  if (!timestamp) return '-'
  return timestamp?.toDate ? moment(timestamp.toDate()).format('DD/MM/YYYY HH:mm') : '-'
}

onMounted(() => {
  loadSolicitudes()
})
</script>
