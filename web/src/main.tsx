import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { PrivyProvider } from '@privy-io/react-auth'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrivyProvider
      appId="cmrin2gkc00j80dl1ew90zgen"
      config={{
        appearance: { theme: 'light', accentColor: '#ff9ebd' },
        loginMethods: ['email', 'wallet'],
        defaultChain: { id: 4221, name: 'Bradbury Testnet', network: 'GenLayer', nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 }, rpcUrls: { default: { http: ['https://rpc-bradbury.genlayer.com'] }, public: { http: ['https://rpc-bradbury.genlayer.com'] } } } as any,
        supportedChains: [{ id: 4221, name: 'Bradbury Testnet', network: 'GenLayer', nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 }, rpcUrls: { default: { http: ['https://rpc-bradbury.genlayer.com'] }, public: { http: ['https://rpc-bradbury.genlayer.com'] } } } as any]
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>,
)
