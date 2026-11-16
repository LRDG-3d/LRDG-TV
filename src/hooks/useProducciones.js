import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase.js'
import { producciones as locales } from '../data/catalogo.js'

const base = { genero: null, sinopsis: null, temporadas: null, episodios: null, portada: null, almacenUrl: null, reparto: [], temporadasDetalle: [] }

/* Une las producciones de catalogo.js con las guardadas en Firestore (en tiempo real). */
export function useProducciones() {
  const [remotas, setRemotas] = useState([])
  const [cargando, setCargando] = useState(Boolean(db))

  useEffect(() => {
    if (!db) return undefined
    return onSnapshot(
      collection(db, 'producciones'),
      (snap) => {
        setRemotas(snap.docs.map((d) => ({ ...base, ...d.data(), id: d.id })))
        setCargando(false)
      },
      () => setCargando(false)
    )
  }, [])

  const producciones = useMemo(() => [...locales, ...remotas], [remotas])
  return { producciones, remotas, cargando }
}
