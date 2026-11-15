// Lee los archivos de un elemento de archive.org (mp4, mkv y zip) y los ordena por número de capítulo
import { formatDuration } from './probe.js'

const RANK = { mp4: 0, mkv: 1, zip: 2 }

export function archiveId(url) {
  const m = url.trim().match(/archive\.org\/(?:download|details|metadata)\/([^/?#]+)/i)
  return m ? decodeURIComponent(m[1]) : null
}

const encodePath = (name) => name.split('/').map(encodeURIComponent).join('/')

const numberOf = (base) => {
  const m = base.match(/cap[ií]tulo\s*0*(\d+)/i) || base.match(/cap\.?\s*0*(\d+)/i) || base.match(/(\d+)/)
  return m ? Number(m[1]) : null
}

const toDuration = (len) => {
  if (len == null || len === '') return ''
  if (String(len).includes(':')) return String(len)
  const n = Number(len)
  return n > 0 ? formatDuration(n) : ''
}

export async function listArchive(url) {
  const id = archiveId(url)
  if (!id) throw new Error('url')
  const r = await fetch('https://archive.org/metadata/' + encodeURIComponent(id))
  if (!r.ok) throw new Error('http')
  const j = await r.json()
  if (!Array.isArray(j.files)) throw new Error('vacio')

  // Solo mp4, mkv y zip
  const items = j.files
    .map((f) => ({ f, ext: f.name.split('.').pop().toLowerCase() }))
    .filter((x) => x.ext in RANK)
    .map((x) => ({ ...x, n: numberOf(x.f.name.split('/').pop().replace(/\.[^.]+$/, '')) }))
    .sort((a, b) => a.f.name.localeCompare(b.f.name, 'es', { numeric: true }))

  // Los que no traen número siguen el orden alfabético
  let next = items.reduce((m, x) => Math.max(m, x.n || 0), 0)
  items.forEach((x) => {
    if (x.n == null) x.n = ++next
  })

  // Un archivo por capítulo: original primero, luego mp4 > mkv > zip, luego el más pesado
  const best = {}
  items.forEach((x) => {
    const cur = best[x.n]
    const score = (y) => [y.f.source === 'original' ? 0 : 1, RANK[y.ext], -(Number(y.f.size) || 0)]
    const better = () => {
      const a = score(x)
      const b = score(cur)
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i]
      return false
    }
    if (!cur || better()) best[x.n] = x
  })

  return Object.values(best)
    .sort((a, b) => a.n - b.n)
    .map((x) => ({
      n: x.n,
      name: x.f.name,
      ext: x.ext,
      d: toDuration(x.f.length),
      url: `https://archive.org/download/${encodeURIComponent(id)}/${encodePath(x.f.name)}`,
    }))
}
