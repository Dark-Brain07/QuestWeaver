import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { PrivyProvider } from '@privy-io/react-auth'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrivyProvider
      appId="clx5z1e4z000008l6b2f4f2q2" // standard public dev id
      config={{
        appearance: { theme: 'dark', accentColor: '#8b5cf6' },
        loginMethods: ['email', 'wallet'],
        defaultChain: { id: 4221, name: 'Bradbury Testnet', network: 'GenLayer', nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 }, rpcUrls: { default: { http: ['https://rpc-bradbury.genlayer.com'] }, public: { http: ['https://rpc-bradbury.genlayer.com'] } } } as any,
        supportedChains: [{ id: 4221, name: 'Bradbury Testnet', network: 'GenLayer', nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 }, rpcUrls: { default: { http: ['https://rpc-bradbury.genlayer.com'] }, public: { http: ['https://rpc-bradbury.genlayer.com'] } } } as any]
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>,
)
