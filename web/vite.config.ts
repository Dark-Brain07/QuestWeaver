import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  define: { global: "globalThis" },
  plugins: [
    react(),
    nodePolyfills(),
  ],
  build: {
    rollupOptions: {
      external: [
        /^__vite-optional-peer-dep:/,
        '@solana-program/system',
        '@solana/kit',
        '@solana-program/token',
        '@solana-program/token-2022',
        '@solana/sysvars'
      ]
    }
  }
})
