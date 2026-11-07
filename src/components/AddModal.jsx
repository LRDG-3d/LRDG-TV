import { useState } from 'react'

const empty = { t: '', s: '', e: '', d: '', u: '' }

export default function AddModal({ open, onClose, onSave, nextEpisode }) {
  const [f, setF] = useState(empty)
  if (!open) return null

  const set = (k) => (ev) => setF({ ...f, [k]: ev.target.value })

  const save = () => {
    if (!f.t.trim()) return
    onSave({ ...f, t: f.t.trim(), s: f.s || 1, e: f.e || nextEpisode, d: f.d.trim(), u: f.u.trim() })
    setF(empty)
  }

  return (
    <div className="modal on" onClick={(ev) => ev.target === ev.currentTarget && onClose()}>
      <div className="box">
        <h3>Agregar capítulo</h3>
        <input placeholder="Título del capítulo" value={f.t} onChange={set('t')} autoFocus />
        <div className="row">
          <input type="number" min="1" placeholder="Temporada" value={f.s} onChange={set('s')} />
          <input type="number" min="1" placeholder="Episodio" value={f.e} onChange={set('e')} />
        </div>
        <input placeholder="Duración (ej. 45:00)" value={f.d} onChange={set('d')} />
        <input placeholder="Enlace del video (opcional)" value={f.u} onChange={set('u')} />
        <div className="row">
          <button className="btn g" onClick={onClose}>Cancelar</button>
          <button className="btn" onClick={save}>Guardar</button>
        </div>
      </div>
    </div>
  )
}
