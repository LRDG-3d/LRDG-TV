import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import Modal, { Actions } from './Modal.jsx'

export default function LoginModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass)
    } catch {
      setError('Correo o contraseña incorrectos.')
    }
    setBusy(false)
  }

  return (
    <Modal title="Acceso de administrador" onClose={onClose} onSubmit={submit}>
      <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
      <input type="password" placeholder="Contraseña" value={pass} onChange={(e) => setPass(e.target.value)} required />
      {error && <p className="err">{error}</p>}
      <Actions onClose={onClose} label={busy ? 'Entrando...' : 'Entrar'} busy={busy} />
    </Modal>
  )
}
