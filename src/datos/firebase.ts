/* ─────────────────────────────────────────────────────────────
   Firebase: cuentas (correo y Google) y copia de los datos de la app en Firestore.

   La configuración web de Firebase es pública (va dentro de cualquier app web); lo que protege
   los datos son las reglas de Firestore (firestore.rules): cada persona solo lee y escribe
   su documento usuarios/{uid}. Plan Spark: gratis.

   Se rellena en CONFIG (o con variables VITE_FIREBASE_* en .env.local). Mientras esté vacía,
   la app funciona como siempre, solo en el móvil, y «Entrar» deja seguir sin cuenta.
   ───────────────────────────────────────────────────────────── */

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
}

export const firebaseConfigurado = Boolean(CONFIG.apiKey && CONFIG.projectId && CONFIG.appId)

const app: FirebaseApp | undefined = firebaseConfigurado ? initializeApp(CONFIG) : undefined
export const auth: Auth | undefined = app && getAuth(app)
export const db: Firestore | undefined = app && getFirestore(app)
