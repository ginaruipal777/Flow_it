import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/* La app se publica en Vercel (https://flow-it-jet.vercel.app/), en la raíz «/».
   Las rutas de React (/inicio, /reto…) las resuelve vercel.json. */
export default defineConfig({
  plugins: [react()],
})
