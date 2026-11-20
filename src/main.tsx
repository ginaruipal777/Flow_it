import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { FlowEstado } from './estado/FlowEstado'
import { SesionProvider } from './estado/Sesion'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* basename: sigue la ruta base de Vite («/» en Vercel) */}
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <SesionProvider>
        <FlowEstado>
          <App />
        </FlowEstado>
      </SesionProvider>
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
