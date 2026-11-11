import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'
import Icon from './components/Icon.jsx'
import Empty from './components/Empty.jsx'
import EpisodeCard from './components/EpisodeCard.jsx'
import Calendar from './components/Calendar.jsx'
import LoginModal from './components/LoginModal.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import Player from './components/Player.jsx'
import SerieCard from './components/SerieCard.jsx'
import SeriePage from './components/SeriePage.jsx'
import useCollection from './hooks/useCollection.js'
import useAdmin from './hooks/useAdmin.js'
import useHash from './hooks/useHash.js'
import useSerieTheme from './hooks/useSerieTheme.js'
import { byNumber } from './utils/sort.js'

const NAV = [
  { id: 'inicio', icon: 'home', label: 'Inicio' },
  { id: 'series', icon: 'play', label: 'Series' },
  { id: 'musica', icon: 'music', label: 'Música', title: 'Música' },
  { id: 'especiales', icon: 'clap', label: 'Especiales', title: 'Especiales' },
  { id: 'noticias', icon: 'news', label: 'Noticias', title: 'Noticias' },
]

export default function App() {
  const serC = useCollection('series')
  const eC = useCollection('episodios')
  const sC = useCollection('temporadas', 'n')
  const rC = useCollection('estrenos', 'f')
  const ser = serC.items
  const eps = eC.items
  const serMap = Object.fromEntries(ser.map((s) => [s.id, s]))

  const user = useAdmin()
  const hash = useHash()
  const [view, setView] = useState('inicio')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  // Rutas: #/admin, #/serie/<id>, #/ver/<id>
  const adminRoute = hash === '#/admin'
  const loginOpen = adminRoute && user === null
  const serieId = hash.startsWith('#/serie/') ? hash.slice(8) : null
  const verId = hash.startsWith('#/ver/') ? hash.slice(6) : null
  const verEp = verId ? eps.find((e) => e.id === verId) : null

  // La página se pinta con el color de la serie que se está viendo
  const activeSerie = serieId ? serMap[serieId] : verEp ? serMap[verEp.serie] : null
  useSerieTheme(activeSerie?.color)

  const leave = () => {
    window.location.hash = '#/'
  }

  if (adminRoute && user) {
    return (
      <AdminPanel serC={serC} sC={sC} eC={eC} rC={rC} onSite={leave} onLogout={() => signOut(auth).then(leave)} />
    )
  }

  if (verId) {
    return (
      <Player
        key={verId}
        ep={verEp}
        eps={eps}
        loaded={eC.loaded}
        onBack={() => {
          window.location.hash = verEp?.serie ? '#/serie/' + verEp.serie : '#/'
        }}
      />
    )
  }

  const go = (id) => {
    setView(id)
    if (serieId) leave()
    window.scrollTo(0, 0)
  }

  const q = query.toLowerCase()
  const ts = (x) => x.creado?.seconds ?? 9e9
  const rank = {}
  eps.forEach((e) => {
    rank[e.serie] = Math.max(rank[e.serie] || 0, ts(e))
  })
  // Series con lo último agregado primero; dentro de cada serie, por número
  const recent = [...eps]
    .sort((a, b) => (rank[b.serie] - rank[a.serie]) || (a.serie === b.serie ? byNumber(b, a) : 0))
    .slice(0, 6)
  const resS = ser.filter((s) => s.nombre.toLowerCase().includes(q))
  const resE = eps.filter((e) => e.t.toLowerCase().includes(q)).sort((a, b) => byNumber(b, a))
  const card = (e, k, isNew) => (
    <EpisodeCard key={e.id} ep={e} index={k} isNew={isNew} label={serMap[e.serie]?.nombre} />
  )
  const section = NAV.find((n) => n.id === view)
  const navActive = serieId ? 'series' : view

  const nav = (
    <nav>
      {NAV.map((n) => (
        <button key={n.id} className={navActive === n.id ? 'on' : ''} aria-label={n.label} onClick={() => go(n.id)}>
          <Icon name={n.icon} className="nav-ico" />
        </button>
      ))}
    </nav>
  )

  if (serieId) {
    const s = serMap[serieId]
    return (
      <>
        {s ? (
          <SeriePage
            key={serieId}
            serie={s}
            seasons={sC.items.filter((x) => x.serie === serieId)}
            eps={eps.filter((e) => e.serie === serieId)}
            estrenos={rC.items.filter((r) => r.serie === serieId)}
            seriesMap={serMap}
            onBack={() => go('series')}
          />
        ) : (
          <main className="view">
            <Empty icon="film">{serC.loaded ? 'No se encontró esta serie.' : 'Cargando...'}</Empty>
          </main>
        )}
        {nav}
      </>
    )
  }

  return (
    <>
      <header className="top">
        <div className="av"><Icon name="rose" /></div>
        <div className="brand">LA <b>ROSANA</b> TV</div>
        <button className="ic" aria-label="Buscar" onClick={() => setSearchOpen(!searchOpen)}>
          <Icon name="search" />
        </button>
      </header>

      {searchOpen && (
        <input
          id="q"
          autoFocus
          placeholder="Buscar series y capítulos..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setView(e.target.value ? 'buscar' : 'inicio')
          }}
        />
      )}

      <main key={view} className="view">
        {view === 'inicio' && (
          <>
            <h2>
              Series
              <button className="more" aria-label="Ver todas las series" onClick={() => go('series')}>›</button>
            </h2>
            {ser.length ? (
              <div className="srow">
                {ser.map((s, i) => <SerieCard key={s.id} serie={s} index={i} />)}
              </div>
            ) : (
              <Empty icon="film">Aún no hay series.</Empty>
            )}
            <h2>Añadidos recientemente</h2>
            {recent.length ? recent.map((e, k) => card(e, k, k === 0)) : (
              <Empty icon="rose">Aún no hay capítulos.</Empty>
            )}
            <Calendar estrenos={rC.items} seriesMap={serMap} />
          </>
        )}

        {view === 'series' && (
          <>
            <h2>Series</h2>
            {ser.length ? (
              <div className="sgrid">
                {ser.map((s, i) => <SerieCard key={s.id} serie={s} index={i} />)}
              </div>
            ) : (
              <Empty icon="film">Aún no hay series.</Empty>
            )}
          </>
        )}

        {view === 'buscar' && (
          <>
            <h2>Resultados</h2>
            {resS.length > 0 && (
              <div className="sgrid" style={{ marginBottom: 16 }}>
                {resS.map((s, i) => <SerieCard key={s.id} serie={s} index={i} />)}
              </div>
            )}
            {resE.map((e, k) => card(e, k, false))}
            {!resS.length && !resE.length && <Empty icon="search">No se encontró nada.</Empty>}
          </>
        )}

        {section?.title && (
          <>
            <h2>{section.title}</h2>
            <Empty icon={section.icon}>Esta sección está vacía por ahora.</Empty>
          </>
        )}
      </main>

      {nav}
      {loginOpen && <LoginModal onClose={leave} />}
    </>
  )
}
