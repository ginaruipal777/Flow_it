import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { FlowEstado } from './estado/FlowEstado'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <FlowEstado>
        <App />
      </FlowEstado>
    </BrowserRouter>
  </StrictMode>,
)
