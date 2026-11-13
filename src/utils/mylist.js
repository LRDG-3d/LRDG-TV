// "Mi lista": series guardadas en este dispositivo
const KEY = 'rosanatv_mylist'

export const getList = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export const inList = (id) => getList().includes(id)

// Devuelve true si la serie quedó en la lista
export function toggleList(id) {
  try {
    const l = getList()
    const has = l.includes(id)
    localStorage.setItem(KEY, JSON.stringify(has ? l.filter((x) => x !== id) : [id, ...l]))
    return !has
  } catch {
    return false
  }
}
