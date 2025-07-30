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
      // API routes to backend server (updated port)
      '/api/v2/blockchain': {
        target: 'http://localhost:3008',
        changeOrigin: true,
        secure: false
      },
      // AI routes to backend server
      '/api/v2/ai': {
        target: 'http://localhost:3008',
        changeOrigin: true,
        secure: false
      },
      // Health check
      '/health': {
        target: 'http://localhost:3008',
        changeOrigin: true,
        secure: false
      },
      // WebSocket for AI
      '/socket.io': {
        target: 'http://localhost:3008',
        changeOrigin: true,
        ws: true
      }
    },
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          web3: ['web3', 'wagmi', 'viem'],
          utils: ['axios', 'clsx', 'tailwind-merge'],
          charts: ['recharts', 'lightweight-charts', 'd3'],
          // Split large libraries further to improve caching
          crypto: ['ethers', 'web3-utils'],
          analytics: ['d3-array', 'd3-scale', 'd3-shape'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      external: [
        // Exclude server-side dependencies from browser bundle
        '@prisma/client',
        'prisma',
        'pg',
        'bcryptjs',
        'jsonwebtoken',
        'redis',
        '@redis/client',
        'node:crypto',
        'node:events',
        'node:net',
        'node:tls',
        'node:url',
        'node:timers/promises',
        'stream',
        'net',
        'tls',
        'dns',
        'crypto',
        'fs',
        'path'
      ]
    },
    chunkSizeWarningLimit: 1500, // Increased for full features
    // Enhanced compression and optimization for full platform
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // Inline small assets to reduce requests
    // Enhanced build options for full feature set
    reportCompressedSize: true,
    sourcemap: process.env.NODE_ENV === 'development'
  },
  base: '/',
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-is'],
    exclude: [
      // Exclude server-side dependencies
      '@prisma/client',
      'pg',
      'bcryptjs',
      'jsonwebtoken',
      'redis'
    ]
  },
  define: {
    // Remove Node.js globals that cause issues in browser
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    // Enhanced feature flags
    'process.env.VITE_FULL_FEATURES': JSON.stringify(process.env.VITE_FULL_FEATURES || 'true'),
    'process.env.VITE_BUILD_TARGET': JSON.stringify(process.env.VITE_BUILD_TARGET || 'full')
  },
})
