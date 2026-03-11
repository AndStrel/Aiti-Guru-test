import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { AppRouter } from './app/providers/router'
import './app/styles/index.css'
import 'antd/dist/reset.css'
import { useAuthStore } from './features/auth/model/useAuthStore'

const queryClient = new QueryClient()

useAuthStore.getState().hydrateAuth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <AppRouter />
      </ConfigProvider>
    </QueryClientProvider>
  </StrictMode>,
)
