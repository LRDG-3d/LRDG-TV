import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// La configuración web de Firebase no es secreta:
// la seguridad la dan las reglas de Firestore (ver firestore.rules).
const app = initializeApp({
  apiKey: 'AIzaSyDEzx6v04WeKiNeiVzincd8zrnSvIedjR0',
  authDomain: 'lrdg-tv.firebaseapp.com',
  projectId: 'lrdg-tv',
  storageBucket: 'lrdg-tv.firebasestorage.app',
  messagingSenderId: '661558065374',
  appId: '1:661558065374:web:6b23c1be694e8613786a4f',
})

export const auth = getAuth(app)
export const db = getFirestore(app)
