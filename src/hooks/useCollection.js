import { useEffect, useState } from 'react'
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export default function useCollection(name, field = 'creado') {
  const [items, setItems] = useState([])

  useEffect(() => {
    const q = query(collection(db, name), orderBy(field, 'asc'))
    return onSnapshot(
      q,
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error('Firestore', name, err)
    )
  }, [name, field])

  const add = (data) => addDoc(collection(db, name), { ...data, creado: serverTimestamp() })
  const remove = (id) => deleteDoc(doc(db, name, id))

  return { items, add, remove }
}
