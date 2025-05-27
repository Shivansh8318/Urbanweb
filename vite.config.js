import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://d2f4-110-235-239-178.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'wss://d2f4-110-235-239-178.ngrok-free.app',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})