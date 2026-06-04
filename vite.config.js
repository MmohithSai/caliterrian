import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split the heavy, rarely-changing vendors into their own long-cached
        // chunks instead of one 756 KB entry bundle. framer-motion is the
        // biggest single dependency, so it gets its own chunk.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('framer-motion') || id.includes('/motion-')) return 'framer-motion'
          if (id.includes('react-router') || id.includes('/@remix-run/')) return 'router'
          if (id.includes('/@radix-ui/')) return 'radix'
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'react-vendor'
        },
      },
    },
  },
})
