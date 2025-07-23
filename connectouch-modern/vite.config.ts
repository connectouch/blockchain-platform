import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@assets': resolve(__dirname, './src/assets'),
      '@stores': resolve(__dirname, './src/stores'),
    },
  },
  server: {
    port: parseInt(process.env.FRONTEND_DEV_PORT || '5173'),
    host: true,
    proxy: {
      // API routes to backend server (corrected port)
      '/api/v2/blockchain': {
        target: 'http://localhost:3006',
        changeOrigin: true,
        secure: false
      },
      // AI routes to backend server
      '/api/v2/ai': {
        target: 'http://localhost:3006',
        changeOrigin: true,
        secure: false
      },
      // Health check
      '/health': {
        target: 'http://localhost:3006',
        changeOrigin: true,
        secure: false
      },
      // WebSocket for AI
      '/socket.io': {
        target: 'http://localhost:3006',
        changeOrigin: true,
        ws: true
      }
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          web3: ['web3', 'wagmi', 'viem'],
          utils: ['axios', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
  base: './',
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
