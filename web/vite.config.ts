import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  define: { global: "globalThis" },
  plugins: [
    react(),
    nodePolyfills(),
  ],
  resolve: {
    alias: {
      '@solana/kit': path.resolve(__dirname, './src/mock.ts'),
      '@solana-program/system': path.resolve(__dirname, './src/mock.ts'),
      '@solana-program/token': path.resolve(__dirname, './src/mock.ts'),
      '@solana-program/token-2022': path.resolve(__dirname, './src/mock.ts'),
      '@solana/sysvars': path.resolve(__dirname, './src/mock.ts'),
      '__vite-optional-peer-dep:@solana-program/token:@privy-io/react-auth': path.resolve(__dirname, './src/mock.ts'),
      '__vite-optional-peer-dep:@solana-program/token-2022:@privy-io/react-auth': path.resolve(__dirname, './src/mock.ts'),
      '__vite-optional-peer-dep:@solana-program/system:@privy-io/react-auth': path.resolve(__dirname, './src/mock.ts'),
      '__vite-optional-peer-dep:@solana/kit:@privy-io/react-auth': path.resolve(__dirname, './src/mock.ts')
    }
  }
})
