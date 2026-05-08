// src/plugins/vuetify.js
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// Tema personalizado premium
const lightTheme = {
  dark: false,
  colors: {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    primary: '#4361EE',
    'primary-darken-1': '#3A56D4',
    secondary: '#FF6B35',
    'secondary-darken-1': '#E55A2B',
    error: '#F44336',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    accent: '#7C3AED',
  },
}

const darkTheme = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#6366F1',
    secondary: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
  },
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
    variations: {
      colors: ['primary', 'secondary', 'accent', 'surface'],
      lighten: 3,
      darken: 3,
    },
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      elevation: '0',
      style: 'text-transform: none; font-weight: 600;',
    },
    VCard: {
      rounded: 'xl',
      elevation: '2',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
  },
})
