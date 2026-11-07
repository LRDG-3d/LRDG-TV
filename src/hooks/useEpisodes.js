import { useEffect, useState } from 'react'
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export default function useEpisodes() {
  const [eps, setEps] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'episodios'), orderBy('creado', 'asc'))
    return onSnapshot(
      q,
      (snap) => setEps(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error('Firestore:', err)
    )
  }, [])

  const add = (ep) => addDoc(collection(db, 'episodios'), { ...ep, creado: serverTimestamp() })
  const remove = (id) => deleteDoc(doc(db, 'episodios', id))

  return { eps, add, remove }
}
