import { useState } from 'react'
import Modal, { Actions } from './Modal.jsx'

export default function CategoriaModal({ series, initial, onSave, onClose }) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [estilo, setEstilo] = useState(initial?.estilo ?? 'normal')
  const [sel, setSel] = useState(initial?.series ?? [])

  const toggle = (id) => setSel((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]))
  const submit = () => {
    if (!nombre.trim()) return
    onSave({ nombre: nombre.trim(), estilo, series: sel })
  }

  return (
    <Modal title={initial ? 'Editar categoría' : 'Agregar categoría'} onClose={onClose} onSubmit={submit}>
      <input placeholder="Nombre (ej. Vive grandes aventuras)" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus={!initial} required />
      <label className="lbl">Tamaño de las tarjetas</label>
      <select value={estilo} onChange={(e) => setEstilo(e.target.value)}>
        <option value="normal">Normal (carátulas verticales)</option>
        <option value="grande">Grande (imagen horizontal)</option>
      </select>
      <label className="lbl">Series de esta categoría</label>
      <div className="checks">
        {series.length ? series.map((s) => (
          <label key={s.id} className="check">
            <input type="checkbox" checked={sel.includes(s.id)} onChange={() => toggle(s.id)} />
            <i className="sdot" style={{ background: s.color }} />
            {s.nombre}
          </label>
        )) : <p className="note">Primero agrega series.</p>}
      </div>
      <Actions onClose={onClose} />
    </Modal>
  )
}
