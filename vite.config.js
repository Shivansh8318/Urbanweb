import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://50aa-110-235-239-178.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'wss://50aa-110-235-239-178.ngrok-free.app',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})