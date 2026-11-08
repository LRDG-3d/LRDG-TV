import { useEffect, useState } from 'react'
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

export default function useCollection(name, field = 'creado') {
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const q = query(collection(db, name), orderBy(field, 'asc'))
    return onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoaded(true)
      },
      (err) => console.error('Firestore', name, err)
    )
  }, [name, field])

  const add = (data) => addDoc(collection(db, name), { ...data, creado: serverTimestamp() })
  const remove = (id) => deleteDoc(doc(db, name, id))
  const update = (id, data) => updateDoc(doc(db, name, id), data)

  return { items, add, remove, update, loaded }
}
