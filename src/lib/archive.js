// Acepta https://archive.org/download/IDENTIFICADOR o https://archive.org/details/IDENTIFICADOR
export const ARCHIVE_URL = /^https:\/\/archive\.org\/(?:download|details)\/([^/?#\s]+)\/?$/i

export const idArchive = (url) => String(url || '').trim().match(ARCHIVE_URL)?.[1] ?? null

export const formatoTamano = (bytes) => {
  if (!bytes) return null
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let n = bytes
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i += 1 }
  return `${n.toFixed(i ? 1 : 0)} ${u[i]}`
}

/* Lee la lista de archivos del item con la API de metadatos de archive.org (permite CORS)
   y devuelve únicamente los .zip, con su enlace de descarga. */
export async function listarZips(url) {
  const id = idArchive(url)
  if (!id) throw new Error('URL de archive.org no válida.')
  const r = await fetch(`https://archive.org/metadata/${encodeURIComponent(id)}`)
  if (!r.ok) throw new Error('No se pudo consultar archive.org.')
  const data = await r.json()
  if (!Array.isArray(data.files)) throw new Error('No se encontró esa carpeta o no es pública.')
  return data.files
    .filter((f) => /\.zip$/i.test(f.name))
    .map((f) => ({
      nombre: f.name,
      tamano: Number(f.size) || null,
      url: `https://archive.org/download/${encodeURIComponent(id)}/${f.name.split('/').map(encodeURIComponent).join('/')}`,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true }))
}
