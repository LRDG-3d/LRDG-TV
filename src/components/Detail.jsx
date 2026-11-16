import { useState } from 'react'
import Poster from './Poster.jsx'
import Card from './Card.jsx'
import Episodios from './Episodios.jsx'

const iniciales = (n) => n.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export default function Detail({ produccion: p, relacionadas, onVolver, onAbrir }) {
  const [tab, setTab] = useState('resumen')
  const [copiado, setCopiado] = useState(false)

  const chips = [
    { t: p.categoria, activo: true },
    { t: String(p.anio) },
    p.temporadas ? { t: `${p.temporadas} ${p.temporadas === 1 ? 'temporada' : 'temporadas'}` } : { t: 'Temporadas: desconocido', mudo: true },
    p.episodios ? { t: `${p.episodios} episodios` } : { t: 'Episodios: desconocido', mudo: true },
    p.genero ? { t: p.genero } : { t: 'Género: desconocido', mudo: true },
  ]

  const compartir = async () => {
    const datos = { title: p.titulo, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(datos)
      else { await navigator.clipboard.writeText(datos.url); setCopiado(true); setTimeout(() => setCopiado(false), 2000) }
    } catch { /* el usuario canceló */ }
  }

  const irATemporadas = () => { setTab('temporadas'); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <article className="detail">
      <button className="back" onClick={onVolver}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        Volver al catálogo
      </button>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'resumen'} className={tab === 'resumen' ? 'is-active' : ''} onClick={() => setTab('resumen')}>Resumen</button>
        <button role="tab" aria-selected={tab === 'temporadas'} className={tab === 'temporadas' ? 'is-active' : ''} onClick={() => setTab('temporadas')}>Temporadas</button>
      </div>

      <div className="cover">
        <Poster produccion={p} />
        <div className="cover__rail">
          <button onClick={irATemporadas} aria-label="Ver temporadas y archivos">
            <svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="currentColor" /></svg>
          </button>
          <button onClick={compartir} aria-label="Compartir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" />
            </svg>
          </button>
        </div>
        {copiado && <span className="cover__toast">Enlace copiado</span>}
      </div>

      {tab === 'resumen' ? (
        <>
          <section className="panel">
            <h1>{p.titulo}</h1>
            <ul className="chips">
              {chips.map((c) => <li key={c.t} className={`chip${c.activo ? ' chip--on' : ''}${c.mudo ? ' chip--mudo' : ''}`}>{c.t}</li>)}
            </ul>
            <p className="panel__texto">{p.sinopsis || 'Sinopsis desconocida.'}</p>
          </section>

          {p.reparto?.length > 0 && (
            <section className="panel">
              <h2>Reparto</h2>
              <ul className="reparto">
                {p.reparto.map((r) => (
                  <li key={r.nombre}>
                    <span className="reparto__avatar" aria-hidden="true">{iniciales(r.nombre)}</span>
                    <span><b>{r.nombre}</b>{r.personaje && <small>{r.personaje}</small>}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {relacionadas.length > 0 && (
            <section className="panel">
              <h2>Recomendados</h2>
              <div className="rail">
                {relacionadas.map((r) => <Card key={r.id} produccion={r} onAbrir={onAbrir} />)}
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="panel">
          <h2>Temporadas</h2>
          <p className="panel__texto">{p.temporadas ? `${p.temporadas} ${p.temporadas === 1 ? 'temporada' : 'temporadas'}` : 'Número de temporadas desconocido.'}</p>
          {p.almacenUrl ? <Episodios url={p.almacenUrl} /> : <p className="note">Esta producción aún no tiene archivos disponibles.</p>}
        </section>
      )}

      <p className="note detail__aviso">Ficha informativa de DLIM TV.</p>
    </article>
  )
}
