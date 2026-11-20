import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

/* Copia de los datos de la app en Firestore: un documento por persona, usuarios/{uid}.
   Se guarda el estado entero como texto JSON (sin campos vacíos que Firestore rechace)
   y la hora del último cambio, para quedarse siempre con la versión más reciente. */

export type CopiaNube = { estado: Record<string, unknown>; actualizado: number }

export async function leerNube(uid: string): Promise<CopiaNube | null> {
  if (!db) return null
  const foto = await getDoc(doc(db, 'usuarios', uid))
  if (!foto.exists()) return null
  const datos = foto.data() as { estado?: string; actualizado?: number }
  if (!datos.estado) return null
  return { estado: JSON.parse(datos.estado) as Record<string, unknown>, actualizado: datos.actualizado ?? 0 }
}

export async function guardarNube(uid: string, estado: object, actualizado: number): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'usuarios', uid), { estado: JSON.stringify(estado), actualizado, version: 2 })
}
