import { useEffect, useRef, useState } from 'react'
import Modal, { Actions } from './Modal.jsx'
import { probe, formatDuration, fileToThumb } from '../utils/probe.js'

export default function EpisodeModal({ seasons, episodes, defaultSeason, onSave, onClose }) {
  const [s, setS] = useState(defaultSeason ?? seasons[seasons.length - 1]?.n ?? '')
  const [e, setE] = useState('')
  const [t, setT] = useState('')
  const [d, setD] = useState('')
  const [u, setU] = useState('')
  const [si, setSi] = useState('')
  const [img, setImg] = useState('')
  const [status, setStatus] = useState('')
  const dTouched = useRef(false)
  const iTouched = useRef(false)

  // Al pegar el enlace, detecta duración y miniatura solas
  useEffect(() => {
    const url = u.trim()
    if (!/^https?:\/\//i.test(url)) {
      setStatus('')
      return
    }
    let off = false
    setStatus('Detectando duración y miniatura...')
    const timer = setTimeout(async () => {
      const r = await probe(url)
      if (off) return
      if (r.dur && !dTouched.current) setD(formatDuration(r.dur))
      if (r.img && !iTouched.current) setImg(r.img)
      setStatus(r.dur ? 'Duración detectada.' : 'No se pudo detectar la duración, escríbela tú.')
    }, 700)
    return () => {
      off = true
      clearTimeout(timer)
    }
  }, [u])

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

  const onFile = async (ev) => {
    const f = ev.target.files?.[0]
    if (!f) return
    try {
      setImg(await fileToThumb(f))
      iTouched.current = true
    } catch {
      setStatus('No se pudo leer esa imagen.')
    }
  }

  const submit = () => {
    if (!t.trim()) return
    onSave({
      t: t.trim(),
      s: Number(s),
      e: Number(e) || nextE,
      d: d.trim(),
      u: u.trim(),
      si: Number(si) || null,
      img: img || null,
    })
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
      <input placeholder="Enlace del video (.mp4, YouTube, Vimeo o Drive)" value={u} onChange={(ev) => setU(ev.target.value)} />
      {status && <p className="note stat">{status}</p>}
      <input
        placeholder="Duración (se detecta sola, o escríbela: 45:00)"
        value={d}
        onChange={(ev) => {
          setD(ev.target.value)
          dTouched.current = true
        }}
      />
      <label className="lbl">Miniatura</label>
      <div className="thumbprev" style={img ? { backgroundImage: `url("${img}")` } : undefined}>
        {!img && 'Sin miniatura'}
      </div>
      <div className="thumbrow">
        <label className="btn g sm">
          Elegir imagen
          <input type="file" accept="image/*" hidden onChange={onFile} />
        </label>
        {img && (
          <button
            type="button"
            className="btn g sm"
            onClick={() => {
              setImg('')
              iTouched.current = true
            }}
          >
            Quitar
          </button>
        )}
      </div>
      <input type="number" min="0" placeholder="Saltar intro hasta el segundo (opcional)" value={si} onChange={(ev) => setSi(ev.target.value)} />
      <Actions onClose={onClose} />
    </Modal>
  )
}
