import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { firebaseConfig } from './firebaseConfig.js'

// Si aún no pegaste tu configuración, el sitio funciona solo con catalogo.js.
export const firebaseListo = !String(firebaseConfig.apiKey).startsWith('PEGA')
const app = firebaseListo ? initializeApp(firebaseConfig) : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
