import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'
import Icon from './components/Icon.jsx'
import Empty from './components/Empty.jsx'
import EpisodeCard from './components/EpisodeCard.jsx'
import LoginModal from './components/LoginModal.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import Player from './components/Player.jsx'
import SerieCard from './components/SerieCard.jsx'
import SeriePage from './components/SeriePage.jsx'
import Rail from './components/Rail.jsx'
import ContinueCard from './components/ContinueCard.jsx'
import useCollection from './hooks/useCollection.js'
import useAdmin from './hooks/useAdmin.js'
import useHash from './hooks/useHash.js'
import useSerieTheme from './hooks/useSerieTheme.js'
import { byNumber } from './utils/sort.js'
import { getProgress } from './utils/progress.js'
import { getList } from './utils/mylist.js'

const NAV = [
  { id: 'inicio', icon: 'home', label: 'Inicio' },
  { id: 'buscar', icon: 'search', label: 'Buscar' },
  { id: 'series', icon: 'play', label: 'Series' },
]

export default function App() {
  const serC = useCollection('series')
  const catC = useCollection('categorias', 'orden')
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
      <AdminPanel serC={serC} catC={catC} sC={sC} eC={eC} rC={rC} onSite={leave} onLogout={() => signOut(auth).then(leave)} />
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
  const resS = ser.filter((s) => s.nombre.toLowerCase().includes(q))
  const resE = eps.filter((e) => e.t.toLowerCase().includes(q)).sort((a, b) => byNumber(b, a))
  const card = (e, k, isNew) => (
    <EpisodeCard key={e.id} ep={e} index={k} isNew={isNew} label={serMap[e.serie]?.nombre} />
  )

  // Seguir viendo (por defecto) y filas por categoría
  const prog = getProgress()
  const mine = getList().map((id) => serMap[id]).filter(Boolean)
  const cont = Object.entries(prog)
    .map(([id, p]) => ({ ep: eps.find((e) => e.id === id), p }))
    .filter((x) => x.ep && x.p.dur && x.p.pos / x.p.dur > 0.02 && x.p.pos / x.p.dur < 0.95)
    .sort((a, b) => b.p.t - a.p.t)
    .slice(0, 10)
  const cats = catC.items
  const inCat = new Set(cats.flatMap((c) => c.series || []))
  const rows = cats
    .map((c) => ({ c, list: (c.series || []).map((id) => serMap[id]).filter(Boolean) }))
    .filter((r) => r.list.length)
  const rest = ser.filter((s) => !inCat.has(s.id))
  const navActive = serieId ? 'series' : view

  const nav = (
    <nav>
      {NAV.map((n) => (
        <button key={n.id} className={navActive === n.id ? 'on' : ''} aria-label={n.label} onClick={() => go(n.id)}>
          <Icon name={n.icon} className="nav-ico" />
          <span>{n.label}</span>
        </button>
      ))}
    </nav>
  )

  if (serieId) {
    const s = serMap[serieId]
    const sameCat = ser.filter(
      (x) => x.id !== serieId && cats.some((c) => (c.series || []).includes(serieId) && (c.series || []).includes(x.id))
    )
    const similar = sameCat.length ? sameCat : ser.filter((x) => x.id !== serieId)
    return (
      <>
        {s ? (
          <SeriePage
            key={serieId}
            serie={s}
            seasons={sC.items.filter((x) => x.serie === serieId)}
            eps={eps.filter((e) => e.serie === serieId)}
            similar={similar}
            onBack={() => go('inicio')}
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
        <div className="av logo"><img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="LA ROSANA TV" /></div>
        <div className="brand">LA <b>ROSANA</b> TV</div>
        <button className="ic" aria-label="Buscar" onClick={() => go('buscar')}>
          <Icon name="search" />
        </button>
      </header>

      <main key={view} className="view">
        {view === 'inicio' && (
          <>
            {cont.length > 0 && (
              <Rail title="Seguir viendo">
                {cont.map((x, i) => (
                  <ContinueCard key={x.ep.id} ep={x.ep} serie={serMap[x.ep.serie]} pct={(x.p.pos / x.p.dur) * 100} index={i} />
                ))}
              </Rail>
            )}

            {mine.length > 0 && (
              <Rail title="Mi lista">
                {mine.map((s, i) => <SerieCard key={s.id} serie={s} index={i} />)}
              </Rail>
            )}

            {rows.map(({ c, list }) => (
              <Rail key={c.id} title={c.nombre}>
                {list.map((s, i) => <SerieCard key={s.id} serie={s} index={i} size={!c.estilo || c.estilo === 'normal' ? 'mediano' : c.estilo} />)}
              </Rail>
            ))}

            {rest.length > 0 && (
              <Rail title={rows.length ? 'Más series' : 'Series'}>
                {rest.map((s, i) => <SerieCard key={s.id} serie={s} index={i} />)}
              </Rail>
            )}

            {!ser.length && <Empty icon="film">Aún no hay series.</Empty>}

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
            <h2>Buscar</h2>
            <input
              id="q"
              autoFocus
              placeholder="Buscar series y capítulos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            {resS.length > 0 && (
              <div className="sgrid" style={{ marginBottom: 16 }}>
                {resS.map((s, i) => <SerieCard key={s.id} serie={s} index={i} />)}
              </div>
            )}
            {query && resE.map((e, k) => card(e, k, false))}
            {query && !resS.length && !resE.length && <Empty icon="search">No se encontró nada.</Empty>}
          </>
        )}
      </main>

      {nav}
      {loginOpen && <LoginModal onClose={leave} />}
    </>
  )
}
