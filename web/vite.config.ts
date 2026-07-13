import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  define: { global: "globalThis" },
  plugins: [
    react(),
  ],
  build: {
    rollupOptions: {
      external: [
        /^__vite-optional-peer-dep:/,
        '@solana-program/system',
        '@solana/kit'
      ]
    }
  }
})
