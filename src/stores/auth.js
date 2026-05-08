// src/stores/auth.js
import { defineStore } from 'pinia'
import { auth, db } from '../firebase'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: true,
    userRole: null,
    tenantId: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isSuperAdmin: (state) => state.user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL,
    isRestaurantAdmin: (state) => state.userRole === 'admin',
    isWaiter: (state) => state.userRole === 'mesero',
  },

  actions: {
    async login(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        this.user = userCredential.user
        await this.fetchUserData(userCredential.user.uid)
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    async register(email, password, restaurantData) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        this.user = userCredential.user

        // Aquí habría que crear el tenant (solo super admin puede)
        // Por ahora, solo registro de usuario
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    async fetchUserData(uid) {
      const userDoc = await getDoc(doc(db, 'usuarios_restaurant', uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        this.userRole = data.rol
        this.tenantId = data.tenantId
      }
    },

    async logout() {
      await signOut(auth)
      this.user = null
      this.userRole = null
      this.tenantId = null
    },

    initAuthListener() {
      onAuthStateChanged(auth, async (user) => {
        this.loading = true
        if (user) {
          this.user = user
          await this.fetchUserData(user.uid)
        } else {
          this.user = null
          this.userRole = null
          this.tenantId = null
        }
        this.loading = false
      })
    },
  },
})
