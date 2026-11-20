/** Errores de Firebase en palabras de la app */
export function mensajeDeError(error: unknown): string {
  const codigo = (error as { code?: string })?.code ?? ''
  const mensajes: Record<string, string> = {
    'auth/invalid-email': 'Ese correo no parece válido. Revísalo.',
    'auth/missing-password': 'Escribe tu contraseña.',
    'auth/invalid-credential': 'El correo o la contraseña no coinciden.',
    'auth/wrong-password': 'El correo o la contraseña no coinciden.',
    'auth/user-not-found': 'No hay ninguna cuenta con ese correo. Puedes crearla.',
    'auth/email-already-in-use': 'Ya hay una cuenta con ese correo. Inicia sesión.',
    'auth/weak-password': 'La contraseña necesita al menos 6 caracteres.',
    'auth/too-many-requests': 'Demasiados intentos seguidos. Espera un poco y vuelve a probar.',
    'auth/network-request-failed': 'Sin conexión. Prueba otra vez cuando tengas internet.',
    'auth/popup-closed-by-user': 'Has cerrado la ventana de Google antes de terminar.',
    'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase todavía.',
    'auth/operation-not-allowed': 'Este modo de entrar no está activado en Firebase.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'La configuración de Firebase no es válida.',
    'auth/configuration-not-found': 'Activa los métodos de acceso en Firebase Authentication.',
  }
  return mensajes[codigo] ?? 'No se ha podido completar. Prueba otra vez.'
}
