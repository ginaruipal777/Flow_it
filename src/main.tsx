import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { FlowEstado } from './estado/FlowEstado'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* basename: en GitHub Pages la app vive en /Flow_it/ */}
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <FlowEstado>
        <App />
      </FlowEstado>
    </BrowserRouter>
  </StrictMode>,
)

// Service worker (PWA): solo en la versión publicada, para no interferir al desarrollar.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* sin service worker la app funciona igual, solo que no sin conexión */
    })
  })
}
