import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://phobetronwebapp-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  preview: {
    port: 8080,
    host: '0.0.0.0',
    allowedHosts: [
      'phobetronwebapp-production-d69a.up.railway.app',
      '.up.railway.app', // Allow all Railway domains
    ]
  }
})
