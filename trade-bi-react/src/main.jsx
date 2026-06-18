import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// 1. Import the TanStack core tools
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 2. Create an instance of the client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache stays fresh for 5 minutes before background re-fetching
      refetchOnWindowFocus: false, // Prevents aggressive re-fetching when clicking back onto the browser tab
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. Wrap your App */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
