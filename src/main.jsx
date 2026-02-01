import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { TamboProvider } from '@tambo-ai/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TamboProvider
      apiKey={import.meta.env.VITE_TAMBO_API_KEY} // In a real app, this would be your actual API key
    >
      <App />
    </TamboProvider>
  </React.StrictMode>,
)
