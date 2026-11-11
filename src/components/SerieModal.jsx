import { useState } from 'react'
import Modal, { Actions } from './Modal.jsx'
import { fileToCover, fileToThumb } from '../utils/probe.js'

const PRESETS = ['#e11d48', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

export default function SerieModal({ initial, onSave, onClose }) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [extra, setExtra] = useState(initial?.extra ?? '')
  const [info, setInfo] = useState(initial?.info ?? '')
  const [color, setColor] = useState(initial?.color ?? PRESETS[5])
  const [img, setImg] = useState(initial?.img ?? '')
  const [banner, setBanner] = useState(initial?.banner ?? '')
  const [msg, setMsg] = useState('')

  const onFile = async (ev) => {
    const f = ev.target.files?.[0]
    if (!f) return
    try {
      setImg(await fileToCover(f))
      setMsg('')
    } catch {
      setMsg('No se pudo leer esa imagen.')
    }
  }

  const submit = () => {
    if (!nombre.trim()) return
    onSave({ nombre: nombre.trim(), extra: extra.trim(), info: info.trim(), color, img: img || null, banner: banner || null })
  }

  return (
    <Modal title={initial ? 'Editar serie' : 'Agregar serie'} onClose={onClose} onSubmit={submit}>
      <input placeholder="Nombre de la serie" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus={!initial} required />
      <input placeholder="Canal o año (ej. Televisa - 2008)" value={extra} onChange={(e) => setExtra(e.target.value)} />
      <textarea placeholder="Información de la serie (sinopsis)" rows="4" value={info} onChange={(e) => setInfo(e.target.value)} />
      <label className="lbl">Color de la serie</label>
      <div className="swatches">
        {PRESETS.map((c) => (
          <button
            type="button"
            key={c}
            className={'sw' + (color === c ? ' on' : '')}
            style={{ background: c }}
            aria-label={`Color ${c}`}
            onClick={() => setColor(c)}
          />
        ))}
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Otro color" />
      </div>
      <label className="lbl">Carátula</label>
      <div className="coverprev" style={img ? { backgroundImage: `url("${img}")` } : { background: color }}>
        {!img && 'Sin carátula'}
      </div>
      <div className="thumbrow">
        <label className="btn g sm">
          Elegir imagen
          <input type="file" accept="image/*" hidden onChange={onFile} />
        </label>
        {img && (
          <button type="button" className="btn g sm" onClick={() => setImg('')}>Quitar</button>
        )}
      </div>
      <label className="lbl">Imagen horizontal (para categorías en tamaño grande, opcional)</label>
      <div className="thumbprev" style={banner ? { backgroundImage: `url("${banner}")` } : undefined}>
        {!banner && 'Sin imagen horizontal'}
      </div>
      <div className="thumbrow">
        <label className="btn g sm">
          Elegir imagen
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={async (ev) => {
              const f = ev.target.files?.[0]
              if (!f) return
              try {
                setBanner(await fileToThumb(f))
                setMsg('')
              } catch {
                setMsg('No se pudo leer esa imagen.')
              }
            }}
          />
        </label>
        {banner && <button type="button" className="btn g sm" onClick={() => setBanner('')}>Quitar</button>}
      </div>
      {msg && <p className="err">{msg}</p>}
      <Actions onClose={onClose} />
    </Modal>
  )
}
