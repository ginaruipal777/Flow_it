/* ─────────────────────────────────────────────────────────────
   Firebase: cuentas (correo y Google) y copia de los datos de la app en Firestore.

   La configuración web de Firebase es pública (va dentro de cualquier app web); lo que protege
   los datos son las reglas de Firestore (firestore.rules): cada persona solo lee y escribe
   su documento usuarios/{uid}. Plan Spark: gratis.

   Sin configuración la app funcionaría como antes, solo en el móvil. Con ella, «Entrar» permite
   cuenta con correo o Google, y siempre se puede seguir sin cuenta.
   ───────────────────────────────────────────────────────────── */

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

/* Proyecto «flow-it-230a9» (plan Spark). Las variables VITE_FIREBASE_* permiten usar otro proyecto. */
const CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyD9wZDmSZA0kEhkOIEc7y7uFEke8lsggdI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'flow-it-230a9.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'flow-it-230a9',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'flow-it-230a9.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '326407149893',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:326407149893:web:df06b2e678748f927d462c',
}

export const firebaseConfigurado = Boolean(CONFIG.apiKey && CONFIG.projectId && CONFIG.appId)

const app: FirebaseApp | undefined = firebaseConfigurado ? initializeApp(CONFIG) : undefined
export const auth: Auth | undefined = app && getAuth(app)
export const db: Firestore | undefined = app && getFirestore(app)
