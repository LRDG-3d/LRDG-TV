import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

export default function useAdmin() {
  const [user, setUser] = useState(null)
  useEffect(() => onAuthStateChanged(auth, setUser), [])
  return user
}
