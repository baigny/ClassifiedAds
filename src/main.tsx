import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'

// Theme: persist to localStorage, default light
const savedTheme = localStorage.getItem('bazaar-theme') || 'light'
if (savedTheme === 'dark') {
  document.documentElement.classList.add('theme-dark')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
