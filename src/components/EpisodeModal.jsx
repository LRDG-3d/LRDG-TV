import { useEffect, useRef, useState } from 'react'
import Modal, { Actions } from './Modal.jsx'
import { probe, formatDuration, fileToThumb } from '../utils/probe.js'

export default function EpisodeModal({ seasons, episodes, defaultSeason, initial, onSave, onClose }) {
  const [s, setS] = useState(initial?.s ?? defaultSeason ?? seasons[seasons.length - 1]?.n ?? '')
  const [e, setE] = useState(initial?.e ? String(initial.e) : '')
  const [t, setT] = useState(initial?.t ?? '')
  const [d, setD] = useState(initial?.d ?? '')
  const [u, setU] = useState(initial?.u ?? '')
  const [si, setSi] = useState(initial?.si ? String(initial.si) : '')
  const [img, setImg] = useState(initial?.img ?? '')
  const [status, setStatus] = useState('')
  const [scanning, setScanning] = useState(false)
  const dTouched = useRef(!!initial?.d)
  const iTouched = useRef(!!initial?.img)
  const runId = useRef(0)
  const valid = /^https?:\/\//i.test(u.trim())

  // Escanea el enlace: duración y miniatura
  const scan = async (url) => {
    const id = ++runId.current
    setScanning(true)
    setStatus('Escaneando el enlace...')
    const apply = (r) => {
      if (id !== runId.current) return
      if (r.dur && !dTouched.current) setD(formatDuration(r.dur))
      if (r.img && !iTouched.current) setImg(r.img)
    }
    const r = await probe(url, apply)
    if (id !== runId.current) return
    apply(r)
    setScanning(false)
    setStatus(
      `${r.dur ? 'Duración ' + formatDuration(r.dur) : 'Duración no detectada (escríbela)'} - ${
        r.img ? 'miniatura lista' : 'sin miniatura (elige una imagen)'
      }`
    )
  }

  // Al pegar un enlace nuevo escanea solo (al editar, solo con el botón)
  useEffect(() => {
    if (initial) return
    const url = u.trim()
    if (!/^https?:\/\//i.test(url)) {
      setStatus('')
      setScanning(false)
      return
    }
    const timer = setTimeout(() => scan(url), 600)
    return () => {
      clearTimeout(timer)
      runId.current++
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
      .filter((x) => x.id !== initial?.id && Number(x.s) === Number(s))
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
    <Modal title={initial ? 'Editar capítulo' : 'Agregar capítulo'} onClose={onClose} onSubmit={submit}>
      <label className="lbl">Temporada</label>
      <select value={s} onChange={(ev) => setS(ev.target.value)}>
        {seasons.map((x) => (
          <option key={x.id} value={x.n}>
            Temporada {x.n}{x.nombre ? ` - ${x.nombre}` : ''}
          </option>
        ))}
      </select>
      <input type="number" min="1" placeholder={`Número de episodio (siguiente: ${nextE})`} value={e} onChange={(ev) => setE(ev.target.value)} />
      <input placeholder="Título del capítulo" value={t} onChange={(ev) => setT(ev.target.value)} autoFocus={!initial} required />
      <input placeholder="Enlace del video (.mp4, YouTube, Vimeo o Drive)" value={u} onChange={(ev) => setU(ev.target.value)} />
      <button
        type="button"
        className="btn scan"
        disabled={!valid || scanning}
        onClick={() => {
          dTouched.current = false
          iTouched.current = false
          scan(u.trim())
        }}
      >
        {scanning ? 'Escaneando...' : 'Escanear URL (duración y miniatura)'}
      </button>
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
