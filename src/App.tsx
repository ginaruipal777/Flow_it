import { Navigate, Route, Routes } from 'react-router-dom'
import { useFlow } from './estado/FlowEstado'
import Sistema from './pages/Sistema/Sistema'
import { Bienvenida, Onboarding } from './pages/Onboarding/Onboarding'
import Entrar from './pages/Entrar/Entrar'
import Inicio from './pages/Inicio/Inicio'
import Seleccion from './pages/Seleccion/Seleccion'
import { Conseguido, Detalle, Enfoque } from './pages/Reto/Reto'
import Tareas from './pages/Tareas/Tareas'
import Perfil, { NuevaCategoria } from './pages/Perfil/Perfil'

/* Flujo (Figma «prot final»):
   /                 00 Bienvenida (solo la primera vez; luego va a /inicio)
   /bienvenida/1-3   O1–O3 Onboarding
   /entrar           L4 Inicio de sesión
   /inicio           01–02 Inicio
   /reto             03–07 Selección (+ 90 categoría, 92 mazo agotado)
   /reto/detalle     08 Detalle (+ 91 archivar)
   /reto/enfoque     09 Enfoque
   /reto/conseguido  10 Reto conseguido
   /tareas           11 Tus tareas
   /perfil           12 Perfil · 12b Retomar
   /perfil/nueva-categoria  13 Crear categoría
   /sistema          Sistema de diseño */

function Raiz() {
  const { estado } = useFlow()
  return estado.onboardingVisto ? <Navigate to="/inicio" replace /> : <Bienvenida />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Raiz />} />
      <Route path="/bienvenida/:paso" element={<Onboarding />} />
      <Route path="/entrar" element={<Entrar />} />
      <Route path="/inicio" element={<Inicio />} />
      <Route path="/reto" element={<Seleccion />} />
      <Route path="/reto/detalle" element={<Detalle />} />
      <Route path="/reto/enfoque" element={<Enfoque />} />
      <Route path="/reto/conseguido" element={<Conseguido />} />
      <Route path="/tareas" element={<Tareas />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/perfil/nueva-categoria" element={<NuevaCategoria />} />
      <Route path="/sistema" element={<Sistema />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
