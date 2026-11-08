import { useState } from 'react'
import Modal, { Actions } from './Modal.jsx'

export default function EpisodeModal({ seasons, episodes, defaultSeason, onSave, onClose }) {
  const [s, setS] = useState(defaultSeason ?? seasons[seasons.length - 1]?.n ?? '')
  const [e, setE] = useState('')
  const [t, setT] = useState('')
  const [d, setD] = useState('')
  const [u, setU] = useState('')
  const [si, setSi] = useState('')

  if (!seasons.length) {
    return (
      <Modal title="Agregar capítulo" onClose={onClose}>
        <p className="note">Primero agrega una temporada desde el botón +.</p>
        <div className="row">
          <button type="button" className="btn" onClick={onClose}>Entendido</button>
        </div>
      </Modal>
    )
  }

  const nextE =
    episodes
      .filter((x) => Number(x.s) === Number(s))
      .reduce((m, x) => Math.max(m, Number(x.e) || 0), 0) + 1

  const submit = () => {
    if (!t.trim()) return
    onSave({ t: t.trim(), s: Number(s), e: Number(e) || nextE, d: d.trim(), u: u.trim(), si: Number(si) || null })
  }

  return (
    <Modal title="Agregar capítulo" onClose={onClose} onSubmit={submit}>
      <label className="lbl">Temporada</label>
      <select value={s} onChange={(ev) => setS(ev.target.value)}>
        {seasons.map((x) => (
          <option key={x.id} value={x.n}>
            Temporada {x.n}{x.nombre ? ` - ${x.nombre}` : ''}
          </option>
        ))}
      </select>
      <input type="number" min="1" placeholder={`Número de episodio (siguiente: ${nextE})`} value={e} onChange={(ev) => setE(ev.target.value)} />
      <input placeholder="Título del capítulo" value={t} onChange={(ev) => setT(ev.target.value)} autoFocus required />
      <input placeholder="Duración (ej. 45:00)" value={d} onChange={(ev) => setD(ev.target.value)} />
      <input placeholder="Enlace del video (.mp4, YouTube, Vimeo o Drive)" value={u} onChange={(ev) => setU(ev.target.value)} />
      <input type="number" min="0" placeholder="Saltar intro hasta el segundo (opcional)" value={si} onChange={(ev) => setSi(ev.target.value)} />
      <Actions onClose={onClose} />
    </Modal>
  )
}
