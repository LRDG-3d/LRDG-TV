// "41:20" o "1:02:10" -> minutos redondeados (0 si no hay duración)
export function minutesOf(d) {
  if (!d) return 0
  const p = String(d).split(':').map(Number)
  if (p.some(isNaN)) return 0
  const sec = p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : p[0] * 60
  return Math.max(1, Math.round(sec / 60))
}
