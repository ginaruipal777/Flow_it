/* Iconos de las preguntas de contexto (api/micro_paso.py → generar_preguntas_contexto).
   Mismo estilo que el resto de la app: línea de 2 px, puntas redondas, color del texto. */

const svg = (cuerpo: string) =>
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${cuerpo}</svg>`

const cara = (boca: string, extra = '') =>
  svg(`<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01"/>${boca}${extra}`)

export const ICONOS_CONTEXTO: Record<string, string> = {
  // herramientas
  movil: svg('<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>'),
  libro: svg('<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5C4.7 20 4 19.3 4 18.5z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5c.8 0 1.5-.7 1.5-1.5z"/>'),
  web: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>'),
  ordenador: svg('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
  papel: svg('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h5"/>'),
  // fases
  leer: svg('<path d="M3 6c3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0z"/><path d="M21 6c-3-1.5-6-1.5-9 0v13c3-1.5 6-1.5 9 0z"/>'),
  test: svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8l1.5 1.5L13 7M9 14l1.5 1.5L13 13M15 8.5h0M15 14.5h0"/>'),
  lupa: svg('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>'),
  ideas: svg('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1v.5h6V15c0-.4.2-.8.5-1.1A6 6 0 0 0 12 3z"/>'),
  borrador: svg('<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3M13 20h7"/>'),
  repasar: svg('<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/><path d="M9 12l2 2 4-4"/>'),
  // casa: zonas
  fregadero: svg('<path d="M3 13h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"/><path d="M12 13V6a2 2 0 0 1 4 0"/>'),
  encimera: svg('<circle cx="10" cy="13" r="6"/><path d="M16 13h5"/>'),
  nevera: svg('<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 10h12M9 6v2M9 13v3"/>'),
  ducha: svg('<path d="M4 21V7a3 3 0 0 1 6 0"/><path d="M8 9h6M13 13v.01M16 13v.01M10 13v.01M13 16v.01M16 16v.01M10 16v.01"/>'),
  suelo: svg('<path d="M3 18h18M5 18l3-5M10 18l3-5M15 18l3-5"/>'),
  cama: svg('<path d="M3 18V8M21 18v-5a3 3 0 0 0-3-3h-8v8M3 14h18"/><circle cx="6.5" cy="11.5" r="1.5"/>'),
  armario: svg('<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M12 3v18M10 11v2M14 11v2"/>'),
  mesa: svg('<path d="M3 9h18M5 9v11M19 9v11M5 14h14"/>'),
  estanteria: svg('<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M4 9h16M4 15h16M8 6v.01M12 12v.01"/>'),
  // casa: herramientas
  trapo: svg('<path d="M4 8c2-2 4-2 6 0s4 2 6 0 3-2 4-1v10c-1-1-2-1-4 1s-4 2-6 0-4-2-6 0z"/>'),
  escoba: svg('<path d="M18 3l-6 9"/><path d="M12 12l-6 1-2 7 9-2 1-5z"/><path d="M7 16l2 2M10 15l1.5 2"/>'),
  manos: svg('<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11V6.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3 15a1.5 1.5 0 0 1 2.5-1.7L8 16"/>'),
  // social y lugar
  mensaje: svg('<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>'),
  llamada: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
  personas: svg('<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5 5"/>'),
  'de-pie': svg('<circle cx="12" cy="4.5" r="2"/><path d="M12 7v7M9 21l3-7 3 7M8 10h8"/>'),
  // bloqueos
  miedo: cara('<path d="M9 16c1-1 2-1.5 3-1.5s2 .5 3 1.5"/>', '<path d="M8 7.5l2 .5M16 7.5l-2 .5"/>'),
  aburrimiento: cara('<path d="M9 15h6"/>'),
  nose: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17v.01"/>'),
  cansancio: svg('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><path d="M15 4h3l-3 3h3"/>'),
  sucio: svg('<path d="M12 3c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z"/><path d="M4 20h2M18 20h2M3 16h1M20 16h1"/>'),
  pereza: svg('<path d="M4 18v-6a2 2 0 0 1 4 0v2h8v-2a2 2 0 0 1 4 0v6zM6 18v2M18 18v2M8 14V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5"/>'),
  ansiedad: svg('<path d="M3 12c1.5-3 3-3 4.5 0s3 3 4.5 0 3-3 4.5 0 3 3 4.5 0"/><path d="M3 7c1.5-3 3-3 4.5 0M16.5 17c1.5 3 3 3 4.5 0"/>'),
  verguenza: cara('<path d="M10 15.5h4"/>', '<path d="M6.5 13h1.5M16 13h1.5"/>'),
}
