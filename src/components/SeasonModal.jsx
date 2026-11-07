import { useState } from 'react'
import Modal, { Actions } from './Modal.jsx'

export default function SeasonModal({ seasons, onSave, onClose }) {
  const next = seasons.reduce((m, s) => Math.max(m, Number(s.n)), 0) + 1
  const [n, setN] = useState(next)
  const [nombre, setNombre] = useState('')
  const exists = seasons.some((s) => Number(s.n) === Number(n))

  const submit = () => {
    if (exists || Number(n) < 1) return
    onSave({ n: Number(n), nombre: nombre.trim() })
  }

  return (
    <Modal title="Agregar temporada" onClose={onClose} onSubmit={submit}>
      <label className="lbl">Número de temporada</label>
      <input type="number" min="1" value={n} onChange={(e) => setN(e.target.value)} />
      <input placeholder="Nombre (opcional)" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      {exists && <p className="err">Esa temporada ya existe.</p>}
      <Actions onClose={onClose} />
    </Modal>
  )
}
