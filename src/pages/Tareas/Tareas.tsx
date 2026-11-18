import { BarraNav } from '../../components/BarraNav/BarraNav'
import { Libreta } from '../../components/Libreta/Libreta'
import { BotonVolver, Pantalla } from '../../components/UI/UI'
import { useFlow } from '../../estado/FlowEstado'
import './Tareas.css'

/* 11 · Tus tareas y 11a · marcando (Figma 2260:2444 y 2260:2368).
   La última tarea completada entra arriba, en blanco, y se marca con animación. */

export default function Tareas() {
  const { estado } = useFlow()
  const completadas = estado.tareas
    .filter((t) => t.estado === 'completada')
    .sort((a, b) => b.actualizada - a.actualizada)

  return (
    <Pantalla fondo="violeta-liso" className="tareas">
      <header className="tareas__cabecera">
        <BotonVolver a="/inicio" color="var(--superficie-crema)" className="tareas__volver" />
        <h1 className="t-titular-l tareas__titulo">
          tus
          <br />
          tareas
        </h1>
      </header>
      <main className="tareas__cuerpo">
        <Libreta
          filas={completadas.map((t) => ({ id: t.id, texto: t.texto, retos: t.retos, hecha: true }))}
          resaltada={estado.recienCompletada}
        />
        <p className="t-texto-cuerpo tareas__nota">
          Sin rachas ni presión: aquí quedan las tareas que has empezado y cuántos retos te costó arrancarlas.
        </p>
      </main>
      <BarraNav />
    </Pantalla>
  )
}
