import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

export default function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!open) return null

  const submit = async (ev) => {
    ev.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass)
      setPass('')
      onClose()
    } catch {
      setError('Correo o contraseña incorrectos.')
    }
    setBusy(false)
  }

  return (
    <div className="modal on" onClick={(ev) => ev.target === ev.currentTarget && onClose()}>
      <form className="box" onSubmit={submit}>
        <h3>Acceso de administrador</h3>
        <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
        <input type="password" placeholder="Contraseña" value={pass} onChange={(e) => setPass(e.target.value)} required />
        {error && <p className="err">{error}</p>}
        <div className="row">
          <button type="button" className="btn g" onClick={onClose}>Cancelar</button>
          <button className="btn" disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button>
        </div>
      </form>
    </div>
  )
}
