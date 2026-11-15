import { useState } from 'react'
import Modal from './Modal.jsx'
import { formatDuration } from '../utils/probe.js'

const EXTS = ['mp4', 'mkv', 'zip']
const SEASON_RE = /(?:^|[_\-\s])T0*(\d+)(?=[_\-\s]|$)/i

// https://archive.org/download/NOMBRE  ->  NOMBRE
const archiveId = (s) => {
  const t = s.trim()
  const m = t.match(/archive\.org\/(?:download|details)\/([^/?#\s]+)/i)
  if (m) return decodeURIComponent(m[1])
  return /^[\w.\-]+$/.test(t) ? t : null
}

async function listFiles(id) {
  const r = await fetch(`https://archive.org/metadata/${encodeURIComponent(id)}`)
  if (!r.ok) throw new Error('http')
  const j = await r.json()
  if (!j.files) throw new Error('vacío')
  return j.files
}

// Archivos mp4, mkv y zip -> un capítulo por número ("Capitulo 3" -> 3)
function buildRows(id, files) {
  const best = new Map()
  const sinNumero = []
  files.forEach((f) => {
    const ext = f.name.split('.').pop().toLowerCase()
    if (!EXTS.includes(ext)) return
    const base = f.name.split('/').pop()
    const m = base.match(/cap[ií]tulo\D*(\d+)/i) || base.match(/(\d+)(?!.*\d)/)
    const n = m ? Number(m[1]) : null
    const num = n && n <= 9999 ? n : null
    // mp4 original, luego mp4 generado por archive.org, luego mkv, luego zip
    const rank = ext === 'mp4' ? (f.source === 'derivative' ? 1 : 0) : ext === 'mkv' ? 2 : 3
    const row = {
      base,
      ext,
      num,
      rank,
      size: Number(f.size) || 0,
      dur: f.length ? parseFloat(f.length) || 0 : 0,
      url: `https://archive.org/download/${id}/${f.name.split('/').map(encodeURIComponent).join('/')}`,
    }
    if (num === null) return sinNumero.push(row)
    const cur = best.get(num)
    if (!cur || row.rank < cur.rank) best.set(num, row)
  })
  const rows = [...best.values()].sort((a, b) => a.num - b.num)
  sinNumero.sort((a, b) => a.base.localeCompare(b.base, undefined, { numeric: true }))
  let n = rows.length ? rows[rows.length - 1].num : 0
  sinNumero.forEach((r) => {
    r.num = ++n
    rows.push(r)
  })
  return rows
}

export default function ImportModal({ seasons, defaultSeason, onImport, onClose }) {
  const [url, setUrl] = useState('')
  const [rows, setRows] = useState(null)
  const [sel, setSel] = useState([])
  const [season, setSeason] = useState(defaultSeason ?? seasons[seasons.length - 1]?.n ?? 1)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const search = async () => {
    const id = archiveId(url)
    if (!id) return setMsg('Pega un enlace de archive.org, por ejemplo https://archive.org/download/NOMBRE')
    setBusy(true)
    setMsg('Buscando archivos...')
    try {
      const r = buildRows(id, await listFiles(id))
      if (!r.length) {
        setMsg('No encontré archivos mp4, mkv ni zip en ese enlace.')
      } else {
        const m = id.match(SEASON_RE)
        if (m) setSeason(Number(m[1]))
        setRows(r)
        setSel(r.map((x) => x.num))
        setMsg('')
      }
    } catch {
      setMsg('No se pudo leer la lista de archivos. Revisa que el enlace sea de archive.org y que sea público.')
    }
    setBusy(false)
  }

  const run = async () => {
    const chosen = rows.filter((r) => sel.includes(r.num))
    if (!chosen.length) return setMsg('Marca al menos un capítulo.')
    setBusy(true)
    const res = await onImport(chosen, Number(season) || 1, setMsg)
    setBusy(false)
    if (res) {
      alert(`Listo: se importaron ${res.ok} capítulos${res.skip ? ` y ${res.skip} ya existían` : ''}.`)
      onClose()
    } else setMsg('')
  }

  const toggle = (n) => setSel((l) => (l.includes(n) ? l.filter((x) => x !== n) : [...l, n]))
  const mb = (b) => (b ? ` - ${Math.round(b / 1048576)} MB` : '')

  return (
    <Modal title="Importar capítulos desde una URL" onClose={onClose} onSubmit={() => (rows ? run() : search())}>
      {!rows ? (
        <>
          <input
            placeholder="https://archive.org/download/NOMBRE"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
            inputMode="url"
          />
          <p className="note stat">
            La carpeta debe tener archivos mp4, mkv o zip con nombres como "Capitulo 1", "Capitulo 2"...
          </p>
        </>
      ) : (
        <>
          <label className="lbl">Temporada (si no existe, se crea sola)</label>
          <input type="number" min="1" value={season} onChange={(e) => setSeason(e.target.value)} />
          <label className="lbl">
            {rows.length} capítulos encontrados ({sel.length} marcados)
          </label>
          <div className="checks">
            {rows.map((r) => (
              <label key={r.num} className="check">
                <input type="checkbox" checked={sel.includes(r.num)} onChange={() => toggle(r.num)} />
                <span>
                  Capítulo {r.num}
                  <small>
                    {r.base}
                    {r.dur ? ` - ${formatDuration(r.dur)}` : ''}
                    {mb(r.size)}
                    {r.ext === 'zip' ? ' - zip (solo descarga)' : ''}
                  </small>
                </span>
              </label>
            ))}
          </div>
          <button type="button" className="btn g sm" style={{ width: '100%', marginBottom: 10 }} onClick={() => setSel(sel.length === rows.length ? [] : rows.map((r) => r.num))}>
            {sel.length === rows.length ? 'Quitar todos' : 'Marcar todos'}
          </button>
        </>
      )}
      {msg && <p className={'note stat' + (/No |Pega|Marca/.test(msg) ? ' bad' : '')}>{msg}</p>}
      <div className="row">
        <button type="button" className="btn g" onClick={rows && !busy ? () => { setRows(null); setMsg('') } : onClose}>
          {rows ? 'Atrás' : 'Cancelar'}
        </button>
        <button className="btn" disabled={busy}>
          {busy ? 'Espera...' : rows ? `Importar ${sel.length}` : 'Buscar archivos'}
        </button>
      </div>
    </Modal>
  )
}
