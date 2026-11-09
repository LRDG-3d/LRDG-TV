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
import useCollection from './hooks/useCollection.js'
import useAdmin from './hooks/useAdmin.js'
import useHash from './hooks/useHash.js'
import { byNumber } from './utils/sort.js'

const NAV = [
  { id: 'inicio', icon: 'home', label: 'Inicio' },
  { id: 'capitulos', icon: 'play', label: 'Capítulos' },
  { id: 'musica', icon: 'music', label: 'Música', title: 'Música' },
  { id: 'especiales', icon: 'clap', label: 'Especiales', title: 'Especiales' },
  { id: 'noticias', icon: 'news', label: 'Noticias', title: 'Noticias' },
]

export default function App() {
  const eC = useCollection('episodios')
  const sC = useCollection('temporadas', 'n')
  const rC = useCollection('estrenos', 'f')
  const eps = eC.items
  const seasons = sC.items

  const user = useAdmin()
  const hash = useHash()
  const [view, setView] = useState('inicio')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  // El panel de admin vive en #/admin
  const adminRoute = hash === '#/admin'
  const loginOpen = adminRoute && user === null
  const leaveAdmin = () => {
    window.location.hash = '#/'
  }

  if (adminRoute && user) {
    return (
      <AdminPanel
        eC={eC}
        sC={sC}
        rC={rC}
        onSite={leaveAdmin}
        onLogout={() => signOut(auth).then(leaveAdmin)}
      />
    )
  }

  const verId = hash.startsWith('#/ver/') ? hash.slice(6) : null
  if (verId) {
    return (
      <Player key={verId} ep={eps.find((e) => e.id === verId)} eps={eps} loaded={eC.loaded} onBack={leaveAdmin} />
    )
  }

  const go = (id) => {
    setView(id)
    window.scrollTo(0, 0)
  }

  const q = query.toLowerCase()
  const filtered = eps.filter((e) => e.t.toLowerCase().includes(q))
  const recent = [...filtered].sort((a, b) => byNumber(b, a)).slice(0, 6)
  const nums = [...new Set([...seasons.map((s) => Number(s.n)), ...eps.map((e) => Number(e.s))])].sort((a, b) => a - b)
  const seasonName = (n) => {
    const s = seasons.find((x) => Number(x.n) === n)
    return `Temporada ${n}` + (s?.nombre ? ` - ${s.nombre}` : '')
  }
  const card = (e, k, isNew) => <EpisodeCard key={e.id} ep={e} index={k} isNew={isNew} />
  const section = NAV.find((n) => n.id === view)

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
          placeholder="Buscar capítulos..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (view === 'inicio') {
              setFilter('all')
              go('capitulos')
            }
          }}
        />
      )}

      <main key={view + filter} className="view">
        {view === 'inicio' && (
          <>
            <h2>
              Añadidos recientemente
              <button className="more" aria-label="Ver todos" onClick={() => go('capitulos')}>›</button>
            </h2>
            {recent.length ? recent.map((e, k) => card(e, k, k === 0 && !query)) : (
              <Empty icon="rose">Aún no hay capítulos.</Empty>
            )}
            <Calendar estrenos={rC.items} />
          </>
        )}

        {view === 'capitulos' && (
          <>
            <h2>Capítulos</h2>
            {nums.length ? (
              <>
                <div className="chips">
                  <div className={'chip' + (filter === 'all' ? ' on' : '')}>
                    <button onClick={() => setFilter('all')}>Todas</button>
                  </div>
                  {nums.map((n) => (
                    <div key={n} className={'chip' + (filter === n ? ' on' : '')}>
                      <button onClick={() => setFilter(n)}>T{n}</button>
                    </div>
                  ))}
                </div>
                {(filter === 'all' ? nums : [filter]).map((n) => {
                  const l = filtered.filter((e) => Number(e.s) === n).sort(byNumber)
                  if (filter === 'all' && query && !l.length) return null
                  return (
                    <section key={n}>
                      <h4 className="dayh">{seasonName(n)}</h4>
                      {l.length ? l.map((e, k) => card(e, k, false)) : (
                        <Empty icon="clap">Sin capítulos en esta temporada.</Empty>
                      )}
                    </section>
                  )
                })}
              </>
            ) : (
              <Empty icon="clap">Aún no hay temporadas ni capítulos.</Empty>
            )}
          </>
        )}

        {section?.title && (
          <>
            <h2>{section.title}</h2>
            <Empty icon={section.icon}>Esta sección está vacía por ahora.</Empty>
          </>
        )}
      </main>

      <nav>
        {NAV.map((n) => (
          <button key={n.id} className={view === n.id ? 'on' : ''} aria-label={n.label} onClick={() => go(n.id)}>
            <Icon name={n.icon} className="nav-ico" />
          </button>
        ))}
      </nav>

      {loginOpen && <LoginModal onClose={leaveAdmin} />}
    </>
  )
}
