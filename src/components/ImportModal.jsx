import { useState } from 'react'
import Modal from './Modal.jsx'
import { listArchive } from '../utils/archive.js'

export default function ImportModal({ seasons, episodes, defaultSeason, onImport, onClose }) {
  const [url, setUrl] = useState('')
  const [season, setSeason] = useState(defaultSeason ?? seasons[seasons.length - 1]?.n ?? '')
  const [found, setFound] = useState(null)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  if (!seasons.length) {
    return (
      <Modal title="Importar capítulos" onClose={onClose}>
        <p className="note">Primero agrega una temporada para esta serie.</p>
        <div className="row">
          <button type="button" className="btn" onClick={onClose}>Entendido</button>
        </div>
      </Modal>
    )
  }

  const have = new Set(episodes.filter((e) => Number(e.s) === Number(season)).map((e) => Number(e.e)))
  const fresh = (found || []).filter((x) => !have.has(x.n))

  const search = async () => {
    setBusy(true)
    setFound(null)
    setStatus('Buscando archivos...')
    try {
      const list = await listArchive(url)
      setFound(list)
      setStatus(
        list.length
          ? `Se encontraron ${list.length} capítulos.`
          : 'No se encontraron archivos .mp4, .mkv ni .zip en esa dirección.'
      )
    } catch (err) {
      setStatus(
        err.message === 'url'
          ? 'La dirección debe ser de archive.org (por ejemplo https://archive.org/download/NOMBRE).'
          : 'No se pudo leer esa dirección. Revisa que el elemento sea público y que esté bien escrita.'
      )
    }
    setBusy(false)
  }

  const run = async () => {
    if (!fresh.length) return
    setBusy(true)
    await onImport({ season: Number(season), items: fresh }, setStatus)
    setBusy(false)
  }

  return (
    <Modal title="Importar capítulos" onClose={onClose} onSubmit={run}>
      <label className="lbl">Temporada donde se agregan</label>
      <select value={season} onChange={(e) => setSeason(e.target.value)}>
        {seasons.map((s) => (
          <option key={s.id} value={s.n}>Temporada {s.n}{s.nombre ? ` - ${s.nombre}` : ''}</option>
        ))}
      </select>
      <input placeholder="https://archive.org/download/NOMBRE" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button type="button" className="btn scan" disabled={busy || !url.trim()} onClick={search}>
        Buscar archivos
      </button>
      {status && <p className="note stat">{status}</p>}
      {found && found.length > 0 && (
        <div className="imp">
          {found.map((x) => (
            <div key={x.n} className={have.has(x.n) ? 'dup' : ''}>
              <b>Capítulo {x.n}</b>
              <span>
                {x.ext.toUpperCase()}{x.d ? ` - ${x.d}` : ''}{have.has(x.n) ? ' - ya existe' : ''}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="row">
        <button type="button" className="btn g" onClick={onClose}>Cancelar</button>
        <button className="btn" disabled={busy || !fresh.length}>
          {fresh.length ? `Importar ${fresh.length}` : 'Importar'}
        </button>
      </div>
    </Modal>
  )
}
