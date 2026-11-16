import { useEffect, useMemo, useRef, useState } from 'react'
import { useProducciones } from './hooks/useProducciones.js'
import Admin from './components/Admin.jsx'
import Header from './components/Header.jsx'
import Card from './components/Card.jsx'
import Detail from './components/Detail.jsx'

const idDe = (hash) => {
  const m = hash.match(/^#\/produccion\/(.+)$/)
  return m ? decodeURIComponent(m[1]) : null
}

export default function App() {
  const { producciones, remotas, cargando } = useProducciones()
  const [hash, setHash] = useState(window.location.hash)
  const id = idDe(hash)
  const esAdmin = hash.startsWith('#/admin')
  const [categoria, setCategoria] = useState('')
  const scrollGuardado = useRef(0)

  // Navegación por hash: funciona en GitHub Pages sin servidor y sin recargar.
  useEffect(() => {
    const alCambiar = () => setHash(window.location.hash)
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  useEffect(() => {
    window.scrollTo(0, id ? 0 : scrollGuardado.current)
  }, [hash]) // eslint-disable-line react-hooks/exhaustive-deps

  const abrir = (nuevo) => {
    if (!id) scrollGuardado.current = window.scrollY
    window.location.hash = `/produccion/${encodeURIComponent(nuevo)}`
  }
  const volver = () => { window.location.hash = '/' }

  const lista = useMemo(
    () =>
      producciones
        .filter((p) => !categoria || p.categoria === categoria)
        .sort((a, b) => a.anio - b.anio || a.titulo.localeCompare(b.titulo, 'es')),
    [categoria, producciones]
  )

  const anios = [...new Set(lista.map((p) => p.anio))]
  const actual = id ? producciones.find((p) => p.id === id) : null

  return (
    <>
      <Header
        categoria={categoria}
        onCategoria={(c) => { setCategoria(c); if (id) volver() }}
        onInicio={() => setCategoria('')}
      />

      <main className="main">
        {esAdmin ? (
          <Admin remotas={remotas} />
        ) : id ? (
          actual ? (
            <Detail
              produccion={actual}
              relacionadas={producciones.filter((p) => p.categoria === actual.categoria && p.id !== actual.id).slice(0, 12)}
              onVolver={volver}
              onAbrir={abrir}
            />
          ) : cargando ? (
            <div className="empty"><p>Cargando…</p></div>
          ) : (
            <div className="empty">
              <h2>No encontramos esa producción</h2>
              <button className="back" onClick={volver}>Volver al catálogo</button>
            </div>
          )
        ) : (
          <>
            <section className="hero">
              <h1>DLIM TV</h1>
              <p>Tu catálogo de series y telenovelas.</p>
            </section>

            {lista.length === 0 ? (
              <div className="empty">
                <h2>Aún no hay producciones</h2>
                <p>Agrégalas en src/data/catalogo.js y aparecerán aquí.</p>
              </div>
            ) : (
              anios.map((a) => (
                <section key={a} className="year">
                  <h2>{a}</h2>
                  <div className="grid">
                    {lista.filter((p) => p.anio === a).map((p) => <Card key={p.id} produccion={p} onAbrir={abrir} />)}
                  </div>
                </section>
              ))
            )}
          </>
        )}
      </main>

      <footer className="footer">DLIM TV · Catálogo informativo. Los datos desconocidos se indican como tales.</footer>
    </>
  )
}
