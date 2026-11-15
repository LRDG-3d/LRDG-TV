import { useState } from 'react'
import Icon from './Icon.jsx'
import { downloadEpisode, removeDownload, isDownloaded } from '../utils/download.js'

export default function DownloadButton({ ep, compact = false }) {
  const [pct, setPct] = useState(null) // null = nada; número = descargando
  const [done, setDone] = useState(() => isDownloaded(ep.id))
  if (!ep.u) return null

  const click = async (e) => {
    e.stopPropagation()
    if (pct !== null) return
    if (done) {
      if (confirm('¿Quitar este capítulo descargado del teléfono?')) {
        await removeDownload(ep.id)
        setDone(false)
      }
      return
    }
    setPct(0)
    try {
      if ((await downloadEpisode(ep, setPct)) === 'app') setDone(true)
    } catch {
      alert('No se pudo descargar el capítulo. Revisa tu conexión y el espacio del teléfono.')
    }
    setPct(null)
  }

  const label = pct !== null ? `${Math.round(pct * 100)}%` : done ? 'Descargado' : 'Descargar'
  return (
    <button
      className={'dl' + (compact ? ' dlc' : '') + (done ? ' done' : '')}
      aria-label={done ? 'Quitar descarga' : 'Descargar capítulo'}
      disabled={pct !== null}
      onClick={click}
    >
      <Icon name={done ? 'check' : 'download'} />
      {(!compact || pct !== null) && <span>{label}</span>}
    </button>
  )
}
