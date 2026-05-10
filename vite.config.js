import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (
            id.includes('/vue/') ||
            id.includes('\\vue\\') ||
            id.includes('vue-router') ||
            id.includes('pinia')
          ) {
            return 'vendor'
          }
          if (id.includes('vuetify')) return 'vuetify'
          if (id.includes('firebase')) return 'firebase'
          if (id.includes('chart.js')) return 'charts'
          if (id.includes('moment')) return 'moment'
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
