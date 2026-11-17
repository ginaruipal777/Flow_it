// Genera los PNG de la PWA a partir de public/icono.svg.
// Uso: node scripts/iconos.mjs
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const svg = await readFile(new URL('../public/icono.svg', import.meta.url))
const salida = (n) => fileURLToPath(new URL(`../public/${n}`, import.meta.url))

for (const [nombre, lado] of [
  ['icono-192.png', 192],
  ['icono-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  await sharp(svg, { density: 300 }).resize(lado, lado).png().toFile(salida(nombre))
}

// «maskable»: el sistema recorta en círculo o cuadrado, así que el dibujo va más pequeño
// sobre fondo violeta a sangre (zona segura del 80 %).
const interior = await sharp(svg, { density: 300 }).resize(400, 400).png().toBuffer()
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#5b3fe0' } })
  .composite([{ input: interior, left: 56, top: 56 }])
  .png()
  .toFile(salida('icono-maskable-512.png'))

console.log('Iconos generados en public/')
