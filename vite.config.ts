import react from '@vitejs/plugin-react'
import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

/* Ruta base:
   - Vercel (y `npm run build`): la app vive en la raíz «/».
   - GitHub Pages: vive en /Flow_it/; el script `npm run publicar` compila con --base /Flow_it/. */

/* GitHub Pages no sabe de rutas de React: si recargas /Flow_it/inicio busca un archivo
   que no existe y muestra 404.html. Copiando index.html como 404.html la app arranca igual.
   (En Vercel lo resuelve vercel.json.) */
function paginaDe404(): Plugin {
  return {
    name: 'flowit-404',
    apply: 'build',
    async closeBundle() {
      await copyFile(resolve('dist/index.html'), resolve('dist/404.html'))
    },
  }
}

export default defineConfig({
  plugins: [react(), paginaDe404()],
})
