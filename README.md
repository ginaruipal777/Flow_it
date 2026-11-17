# Flow it!

App web (PWA) a partir del prototipo de Figma `4wN8n9bV4Wj67Mevi3zBlW`. React + Vite + TypeScript.

## Arrancar

```bash
npm install
npm run dev
```

Abre `http://localhost:5173/sistema`.

## Estructura

- `src/styles/tokens.css`: colores de «Flow it! · Color», colores de carta de «Carta de reto · Tipo» (por `data-tipo`) y estilos de texto (`.t-*`).
- `src/components/Boton`: Botón v3 (Figma 2032:1123).
- `src/components/CartaReto`: Carta de reto · Selección (Figma 4208:2791), 5 tipos.
- `src/components/Icono`: iconos SVG exportados de Figma con `currentColor`.
- `src/assets/iconos/categoria`: los 10 iconos de categoría.
- `src/pages/Sistema`: página `/sistema` con colores, tipografías, botones y cartas.

## Estado

Fase 1. La PWA (manifest y service worker) llega en fases posteriores.
