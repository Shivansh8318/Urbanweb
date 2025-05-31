import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://47ff-45-118-158-197.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'wss://47ff-45-118-158-197.ngrok-free.app',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})