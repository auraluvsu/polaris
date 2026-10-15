import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { exportSeedData } from './exportSeed'
import './index.css'

// TEMPORARY: one-time seed export. Remove this block after the export has run.
if (import.meta.env.DEV) {
  Object.assign(window, { exportSeedData })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
