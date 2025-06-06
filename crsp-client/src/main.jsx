import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Initialize dark mode before rendering
const initializeDarkMode = () => {
  const savedMode = localStorage.getItem('darkMode')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = savedMode ? savedMode === 'true' : systemPrefersDark
  document.documentElement.classList.toggle('dark', isDark)
  return isDark
}

initializeDarkMode()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)