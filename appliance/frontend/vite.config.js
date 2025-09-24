import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // listen ทุก network interface
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '*.ngrok-free.app',
      '*.ngrok-free.dev',
      'teagan-oosporic-singly.ngrok-free.dev'
    ],
    cors: true, // เผื่อมีปัญหา cross-origin
  }
})
