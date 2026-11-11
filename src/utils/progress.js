// "Seguir viendo": guarda en este dispositivo hasta dónde llegó cada capítulo
const KEY = 'rosanatv_progress'

export const getProgress = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveProgress(id, pos, dur) {
  try {
    const m = getProgress()
    m[id] = { pos, dur, t: Date.now() }
    localStorage.setItem(KEY, JSON.stringify(m))
  } catch {}
}

export function clearProgress(id) {
  try {
    const m = getProgress()
    delete m[id]
    localStorage.setItem(KEY, JSON.stringify(m))
  } catch {}
}
