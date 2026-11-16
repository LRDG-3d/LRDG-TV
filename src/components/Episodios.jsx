import { useEffect, useState } from 'react'
import { formatoTamano, listarZips } from '../lib/archive.js'

export default function Episodios({ url }) {
  const [estado, setEstado] = useState({ cargando: true, archivos: [], error: '' })

  useEffect(() => {
    let activo = true
    setEstado({ cargando: true, archivos: [], error: '' })
    listarZips(url)
      .then((archivos) => activo && setEstado({ cargando: false, archivos, error: '' }))
      .catch((e) => activo && setEstado({ cargando: false, archivos: [], error: e.message }))
    return () => { activo = false }
  }, [url])

  const { cargando, archivos, error } = estado

  return (
    <div className="episodios">
      <h2>Archivos .zip</h2>
      {cargando && <p className="note">Buscando archivos…</p>}
      {error && <p className="note">{error}</p>}
      {!cargando && !error && archivos.length === 0 && <p className="note">No hay archivos .zip disponibles.</p>}
      <ul>
        {archivos.map((a) => (
          <li key={a.url}>
            <span>{a.nombre}</span>
            {a.tamano && <small>{formatoTamano(a.tamano)}</small>}
            <a href={a.url} target="_blank" rel="noopener noreferrer">Descargar</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
