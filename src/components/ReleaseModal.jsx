import { useState } from 'react'
import Modal, { Actions } from './Modal.jsx'
import { ymd } from '../utils/dates.js'

export default function ReleaseModal({ seasons, defaultDate, onSave, onClose }) {
  const [t, setT] = useState('')
  const [f, setF] = useState(defaultDate || ymd(new Date()))
  const [h, setH] = useState('')
  const [s, setS] = useState('')
  const [e, setE] = useState('')

  const submit = () => {
    if (!t.trim() || !f) return
    onSave({ t: t.trim(), f, h, s: s ? Number(s) : null, e: e ? Number(e) : null })
  }

  return (
    <Modal title="Agregar estreno" onClose={onClose} onSubmit={submit}>
      <input placeholder="Título del capítulo que sale" value={t} onChange={(ev) => setT(ev.target.value)} autoFocus required />
      <div className="row">
        <div className="col">
          <label className="lbl">Temporada</label>
          <select value={s} onChange={(ev) => setS(ev.target.value)}>
            <option value="">Sin temporada</option>
            {seasons.map((x) => (
              <option key={x.id} value={x.n}>Temporada {x.n}</option>
            ))}
          </select>
        </div>
        <div className="col">
          <label className="lbl">Episodio</label>
          <input type="number" min="1" placeholder="Nº" value={e} onChange={(ev) => setE(ev.target.value)} />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <label className="lbl">Fecha</label>
          <input type="date" value={f} onChange={(ev) => setF(ev.target.value)} required />
        </div>
        <div className="col">
          <label className="lbl">Hora (opcional)</label>
          <input type="time" value={h} onChange={(ev) => setH(ev.target.value)} />
        </div>
      </div>
      <Actions onClose={onClose} />
    </Modal>
  )
}
