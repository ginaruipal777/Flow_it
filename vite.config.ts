import react from '@vitejs/plugin-react'
import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

/* GitHub Pages sirve la app en https://ginaruipal777.github.io/Flow_it/,
   así que al compilar todas las rutas cuelgan de /Flow_it/. */
const BASE_PAGES = '/Flow_it/'

/* GitHub Pages no sabe de rutas de React: si recargas /Flow_it/inicio busca un archivo
   que no existe y muestra 404.html. Copiando index.html como 404.html la app arranca igual. */
function paginaDe404(): Plugin {
  return {
    name: 'flowit-404',
    apply: 'build',
    async closeBundle() {
      await copyFile(resolve('dist/index.html'), resolve('dist/404.html'))
    },
  }
}

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? BASE_PAGES : '/',
  plugins: [react(), paginaDe404()],
}))
