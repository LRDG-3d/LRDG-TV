import { useState } from 'react'

const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

const resolver = (ruta) =>
  /^(https?:|data:)/.test(ruta) ? ruta : `${import.meta.env.BASE_URL}${ruta.replace(/^\//, '')}`

/* Muestra la portada si existe; si no, genera un póster con el título. */
export default function Poster({ produccion }) {
  const [fallo, setFallo] = useState(false)
  const { titulo, anio, portada } = produccion

  if (portada && !fallo) {
    return (
      <div className="poster">
        <img src={resolver(portada)} alt={`Portada de ${titulo}`} loading="lazy" onError={() => setFallo(true)} />
      </div>
    )
  }

  const h = hash(titulo) % 360
  const estilo = { background: `linear-gradient(165deg, hsl(${h} 55% 34%), hsl(${(h + 50) % 360} 60% 12%))` }
  return (
    <div className="poster poster--generado" style={estilo} role="img" aria-label={`Póster generado para ${titulo}`}>
      <span className="poster__anio">{anio}</span>
      <span className="poster__titulo">{titulo}</span>
    </div>
  )
}
