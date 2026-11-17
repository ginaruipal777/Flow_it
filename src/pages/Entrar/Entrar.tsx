import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Boton } from '../../components/Boton/Boton'
import { Logotipo, Pantalla } from '../../components/UI/UI'
import { useFlow } from '../../estado/FlowEstado'
import './Entrar.css'

/* L4 · Inicio de sesión · «hola de nuevo» (Figma 4130:2626).
   De momento no hay cuentas: cualquier botón entra en la app. */

export default function Entrar() {
  const navegar = useNavigate()
  const { despachar } = useFlow()
  const [verClave, setVerClave] = useState(false)

  const entrar = (e?: FormEvent) => {
    e?.preventDefault()
    despachar({ tipo: 'onboarding-visto' })
    navegar('/inicio', { replace: true })
  }

  return (
    <Pantalla fondo="tinta" className="entrar">
      <header className="entrar__cabecera">
        <Logotipo />
      </header>
      <form className="entrar__cuerpo" onSubmit={entrar}>
        <h1 className="t-titular-display entrar__titulo">
          <span className="entrar__crema">hola de</span>
          <br />
          <span className="entrar__lima">nuevo</span>
        </h1>

        <label className="campo">
          <span className="t-texto-cuerpo">Correo electrónico</span>
          <input className="campo__control t-texto-cuerpo" type="email" autoComplete="email" placeholder="tu@correo.com" />
        </label>

        <label className="campo">
          <span className="t-texto-cuerpo">Contraseña</span>
          <span className="campo__control campo__control--con-accion">
            <input
              className="t-texto-cuerpo"
              type={verClave ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••"
            />
            <button type="button" className="campo__accion t-texto-control" onClick={() => setVerClave((v) => !v)}>
              {verClave ? 'Ocultar' : 'Mostrar'}
            </button>
          </span>
        </label>

        <button type="button" className="entrar__olvido t-texto-cuerpo">
          ¿Has olvidado la contraseña?
        </button>

        <Boton type="submit" conIcono={false} className="boton--ancho entrar__principal">
          Iniciar sesión
        </Boton>

        <div className="entrar__separador">
          <span />
          <p className="t-texto-cuerpo-s">o continúa con</p>
          <span />
        </div>

        <div className="entrar__otras">
          <Boton estilo="secundario" conIcono={false} onClick={() => entrar()}>
            Apple
          </Boton>
          <Boton estilo="secundario" conIcono={false} onClick={() => entrar()}>
            Google
          </Boton>
        </div>

        <p className="entrar__pie">
          <span className="t-texto-cuerpo">¿No tienes cuenta?</span>
          <button type="button" className="t-texto-control entrar__crear" onClick={() => navegar('/bienvenida/1')}>
            Crear cuenta
          </button>
        </p>
      </form>
    </Pantalla>
  )
}
