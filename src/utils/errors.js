import { auth } from '../firebase'

// Traduce el error de Firebase a un mensaje que diga qué corregir
export function explain(err) {
  const code = String(err?.code || err).replace('firestore/', '')
  const email = auth.currentUser?.email || 'sin sesión'
  const msgs = {
    'permission-denied':
      `Las reglas de Firestore rechazaron el guardado.\n\nTu sesión es: ${email}\n\nEse correo debe ser exactamente el que está en las reglas, y las reglas deben incluir la colección que estás usando (episodios, temporadas y estrenos).`,
    'not-found': 'La base de datos de Firestore no existe o tiene otro nombre. Revisa que se llame "(default)".',
    unavailable: 'No hay conexión con Firebase. Revisa tu internet.',
    unauthenticated: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  }
  return `${msgs[code] || 'No se pudo guardar.'}\n\nCódigo: ${code}`
}
