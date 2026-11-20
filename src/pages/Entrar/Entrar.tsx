import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Boton } from '../../components/Boton/Boton'
import { Logotipo, Pantalla } from '../../components/UI/UI'
import { useFlow } from '../../estado/FlowEstado'
import { useSesion } from '../../estado/Sesion'
import { mensajeDeError } from '../../estado/mensajes-sesion'
import './Entrar.css'

/* L4 · Inicio de sesión · «hola de nuevo» (Figma 4130:2626).
   Cuentas con Firebase: correo + contraseña o Google. Los datos de la app se guardan en la nube
   (FlowEstado + nube.ts). También se puede seguir sin cuenta: entonces todo se queda en el móvil. */

type Modo = 'entrar' | 'crear'

export default function Entrar() {
  const navegar = useNavigate()
  const [parametros] = useSearchParams()
  const { despachar } = useFlow()
  const sesion = useSesion()
  const [modo, setModo] = useState<Modo>(parametros.get('modo') === 'crear' ? 'crear' : 'entrar')
  const [verClave, setVerClave] = useState(false)
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const continuar = () => {
    despachar({ tipo: 'onboarding-visto' })
    navegar('/inicio', { replace: true })
  }

  // Con la sesión ya abierta (o al volver de Google), directa a la app
  useEffect(() => {
    if (sesion.usuario) continuar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesion.usuario])

  const intentar = async (accion: () => Promise<void>) => {
    setError('')
    setAviso('')
    setOcupado(true)
    try {
      await accion()
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setOcupado(false)
    }
  }

  const enviar = (e?: FormEvent) => {
    e?.preventDefault()
    if (!sesion.disponible) return continuar()
    void intentar(() => (modo === 'crear' ? sesion.crearCuenta(correo, clave) : sesion.entrar(correo, clave)))
  }

  const recuperar = () => {
    if (!correo.trim()) {
      setError('Escribe tu correo arriba y vuelve a pulsar aquí.')
      return
    }
    void intentar(async () => {
      await sesion.recuperarClave(correo)
      setAviso('Te hemos enviado un correo para cambiar la contraseña.')
    })
  }

  return (
    <Pantalla fondo="tinta" className="entrar">
      <header className="entrar__cabecera">
        <Logotipo />
      </header>
      <form className="entrar__cuerpo" onSubmit={enviar} noValidate>
        <h1 className="t-titular-display entrar__titulo">
          <span className="entrar__crema">{modo === 'crear' ? 'crea tu' : 'hola de'}</span>
          <br />
          <span className="entrar__lima">{modo === 'crear' ? 'cuenta' : 'nuevo'}</span>
        </h1>

        {!sesion.disponible && (
          <p className="entrar__nota t-texto-cuerpo-s" role="note">
            Las cuentas todavía no están activadas. Puedes usar la app: tus datos se guardan en este móvil.
          </p>
        )}

        <label className="campo">
          <span className="t-texto-cuerpo">Correo electrónico</span>
          <input
            className="campo__control t-texto-cuerpo"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            disabled={!sesion.disponible}
          />
        </label>

        <label className="campo">
          <span className="t-texto-cuerpo">Contraseña</span>
          <span className="campo__control campo__control--con-accion">
            <input
              className="t-texto-cuerpo"
              type={verClave ? 'text' : 'password'}
              autoComplete={modo === 'crear' ? 'new-password' : 'current-password'}
              placeholder={modo === 'crear' ? 'Al menos 6 caracteres' : '••••••••••'}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              disabled={!sesion.disponible}
            />
            <button type="button" className="campo__accion t-texto-control" onClick={() => setVerClave((v) => !v)}>
              {verClave ? 'Ocultar' : 'Mostrar'}
            </button>
          </span>
        </label>

        {modo === 'entrar' && sesion.disponible && (
          <button type="button" className="entrar__olvido t-texto-cuerpo" onClick={recuperar} disabled={ocupado}>
            ¿Has olvidado la contraseña?
          </button>
        )}

        <p className="entrar__mensaje t-texto-cuerpo-s" role={error ? 'alert' : 'status'} data-error={error ? '' : undefined}>
          {error || aviso}
        </p>

        <Boton type="submit" conIcono={false} className="boton--ancho entrar__principal" disabled={ocupado}>
          {!sesion.disponible ? 'Entrar sin cuenta' : ocupado ? 'Un momento…' : modo === 'crear' ? 'Crear cuenta' : 'Iniciar sesión'}
        </Boton>

        {sesion.conGoogle && (
          <>
            <div className="entrar__separador">
              <span />
              <p className="t-texto-cuerpo-s">o continúa con</p>
              <span />
            </div>
            <div className="entrar__otras">
              <Boton estilo="secundario" conIcono={false} disabled={ocupado} onClick={() => void intentar(sesion.entrarConGoogle)}>
                Google
              </Boton>
            </div>
          </>
        )}

        {sesion.disponible && (
          <p className="entrar__pie">
            <span className="t-texto-cuerpo">{modo === 'crear' ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}</span>
            <button
              type="button"
              className="t-texto-control entrar__crear"
              onClick={() => {
                setModo(modo === 'crear' ? 'entrar' : 'crear')
                setError('')
                setAviso('')
              }}
            >
              {modo === 'crear' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </p>
        )}

        {sesion.disponible && (
          <button type="button" className="entrar__sin-cuenta t-texto-cuerpo-s" onClick={continuar}>
            Seguir sin cuenta (los datos se quedan solo en este móvil)
          </button>
        )}
      </form>
    </Pantalla>
  )
}
