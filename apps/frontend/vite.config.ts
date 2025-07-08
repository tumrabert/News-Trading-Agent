
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
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
    allowedHosts: ['35d4-103-176-152-45.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        ws: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [],
    },
  },
})
