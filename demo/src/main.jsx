import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { StoreProvider, getActiveDemo } from './store.jsx'
import './styles/app.css'

const activeDemo = getActiveDemo()

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider demoName={activeDemo}>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>
)
