// Descarga de capítulos dentro de la app (Android). En el navegador abre el enlace.
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'

const KEY = 'rosanatv_downloads'

export const isApp = () => Capacitor.isNativePlatform()

export const getDownloads = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}
const setDownloads = (m) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(m))
  } catch {}
}

export const isDownloaded = (id) => isApp() && !!getDownloads()[id]

const extOf = (url) => ((url.match(/\.(mp4|mkv|zip)(?:[?#]|$)/i) || [])[1] || 'mp4').toLowerCase()

// Devuelve 'app' si se guardó en el teléfono o 'web' si solo abrió el enlace
export async function downloadEpisode(ep, onProgress = () => {}) {
  if (!isApp()) {
    window.open(ep.u, '_blank', 'noopener')
    return 'web'
  }
  const path = `descargas/${ep.id}.${extOf(ep.u)}`
  const sub = await Filesystem.addListener('progress', (p) => {
    if (p.url === ep.u && p.contentLength) onProgress(p.bytes / p.contentLength)
  })
  try {
    await Filesystem.downloadFile({ url: ep.u, path, directory: Directory.Data, recursive: true, progress: true })
  } finally {
    sub.remove()
  }
  const m = getDownloads()
  m[ep.id] = { path, t: Date.now() }
  setDownloads(m)
  return 'app'
}

export async function removeDownload(id) {
  const m = getDownloads()
  const d = m[id]
  if (!d) return
  try {
    await Filesystem.deleteFile({ path: d.path, directory: Directory.Data })
  } catch {}
  delete m[id]
  setDownloads(m)
}

// Dirección del archivo guardado, para verlo sin internet
export async function localSrc(id) {
  const d = getDownloads()[id]
  if (!d || !isApp()) return null
  try {
    const { uri } = await Filesystem.getUri({ path: d.path, directory: Directory.Data })
    return Capacitor.convertFileSrc(uri)
  } catch {
    return null
  }
}
