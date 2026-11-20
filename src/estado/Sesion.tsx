import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import { auth, firebaseConfigurado } from '../datos/firebase'

/* Sesión con Firebase Authentication: correo + contraseña y Google.
   Sin configuración de Firebase, `disponible` es false y la app sigue sin cuentas. */

/** Dentro de una app que envuelve la web (Median/GoNative u otra vista web incrustada), Google no
    deja iniciar sesión («Error 403: disallowed_useragent»): ahí solo se ofrece correo y contraseña. */
function enVistaWeb(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as unknown as { median?: unknown; gonative?: unknown }
  const ua = navigator.userAgent
  return (
    Boolean(w.median || w.gonative) ||
    /median|gonative/i.test(ua) ||
    /; wv\)/.test(ua) || // Android WebView
    (/(iPhone|iPad|iPod)/.test(ua) && /AppleWebKit/.test(ua) && !/Safari/.test(ua)) // iOS WKWebView
  )
}

type Sesion = {
  disponible: boolean
  /** Google se puede usar aquí (no dentro de una app envoltorio como Median) */
  conGoogle: boolean
  /** null: sin sesión; undefined: todavía comprobando */
  usuario: User | null | undefined
  entrar: (correo: string, clave: string) => Promise<void>
  crearCuenta: (correo: string, clave: string) => Promise<void>
  entrarConGoogle: () => Promise<void>
  recuperarClave: (correo: string) => Promise<void>
  salir: () => Promise<void>
}

const Ctx = createContext<Sesion | null>(null)

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null | undefined>(firebaseConfigurado ? undefined : null)

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, setUsuario)
  }, [])

  const valor = useMemo<Sesion>(() => {
    const necesitaAuth = () => {
      if (!auth) throw Object.assign(new Error('sin firebase'), { code: 'auth/operation-not-allowed' })
      return auth
    }
    return {
      disponible: firebaseConfigurado,
      conGoogle: firebaseConfigurado && !enVistaWeb(),
      usuario,
      entrar: async (correo, clave) => {
        await signInWithEmailAndPassword(necesitaAuth(), correo.trim(), clave)
      },
      crearCuenta: async (correo, clave) => {
        await createUserWithEmailAndPassword(necesitaAuth(), correo.trim(), clave)
      },
      entrarConGoogle: async () => {
        const a = necesitaAuth()
        const proveedor = new GoogleAuthProvider()
        proveedor.setCustomParameters({ prompt: 'select_account' })
        try {
          await signInWithPopup(a, proveedor)
        } catch (error) {
          // En móviles o en la app instalada el navegador puede bloquear la ventana: se va a Google y vuelve
          const codigo = (error as { code?: string })?.code
          if (codigo === 'auth/popup-blocked' || codigo === 'auth/operation-not-supported-in-this-environment') {
            await signInWithRedirect(a, proveedor)
            return
          }
          throw error
        }
      },
      recuperarClave: async (correo) => {
        await sendPasswordResetEmail(necesitaAuth(), correo.trim())
      },
      salir: async () => {
        if (auth) await signOut(auth)
      },
    }
  }, [usuario])

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSesion() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useSesion fuera de <SesionProvider>')
  return c
}
