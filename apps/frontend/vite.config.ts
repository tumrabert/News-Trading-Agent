
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@workspace/shared-types': path.resolve(__dirname, '../../packages/shared-types/dist'),
      '@workspace/api-client': path.resolve(__dirname, '../../packages/api-client/dist'),
    },
  },
  optimizeDeps: {
    include: ['@workspace/shared-types', '@workspace/api-client'],
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
