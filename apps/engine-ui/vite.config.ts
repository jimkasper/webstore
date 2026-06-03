import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://engine:8080', changeOrigin: true },
      '/ap': { target: 'http://engine:8080', changeOrigin: true },
      '/.well-known': { target: 'http://engine:8080', changeOrigin: true },
      '/ws': { target: 'http://engine:8080', changeOrigin: true, ws: true },
    },
  },
})
