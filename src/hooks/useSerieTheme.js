import { useEffect } from 'react'

// Texto claro u oscuro según el color elegido
const isLight = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 160
}

// Pinta toda la página con el color de la serie que se está viendo
export default function useSerieTheme(color) {
  useEffect(() => {
    const el = document.documentElement
    if (!color) {
      el.classList.remove('themed')
      el.style.removeProperty('--serie')
      el.style.removeProperty('--on')
      return
    }
    el.classList.add('themed')
    el.style.setProperty('--serie', color)
    el.style.setProperty('--on', isLight(color) ? '#111' : '#fff')
  }, [color])
}
