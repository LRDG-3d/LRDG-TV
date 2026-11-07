import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'
import Icon from './components/Icon.jsx'
import Empty from './components/Empty.jsx'
import EpisodeCard from './components/EpisodeCard.jsx'
import Calendar from './components/Calendar.jsx'
import LoginModal from './components/LoginModal.jsx'
import AdminMenu from './components/AdminMenu.jsx'
import SeasonModal from './components/SeasonModal.jsx'
import EpisodeModal from './components/EpisodeModal.jsx'
import ReleaseModal from './components/ReleaseModal.jsx'
import useCollection from './hooks/useCollection.js'
import useAdmin from './hooks/useAdmin.js'
import useHash from './hooks/useHash.js'

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
  const [sheet, setSheet] = useState(null)
  const [relDate, setRelDate] = useState('')

  // El panel de admin vive en #/admin
  const adminRoute = hash === '#/admin'
  const isAdmin = adminRoute && !!user
  const loginOpen = adminRoute && user === null

  const go = (id) => {
    setView(id)
    window.scrollTo(0, 0)
  }
  const leaveAdmin = () => {
    window.location.hash = '#/'
  }
  const run = async (fn, after) => {
    try {
      await fn()
      setSheet(null)
      after?.()
    } catch {
      alert('No se pudo guardar. Revisa que hayas iniciado sesión con el correo admin.')
    }
  }

  const q = query.toLowerCase()
  const filtered = eps.filter((e) => e.t.toLowerCase().includes(q))
  const recent = [...filtered].reverse().slice(0, 6)
  const nums = [...new Set([...seasons.map((s) => Number(s.n)), ...eps.map((e) => Number(e.s))])].sort((a, b) => a - b)
  const seasonName = (n) => {
    const s = seasons.find((x) => Number(x.n) === n)
    return `Temporada ${n}` + (s?.nombre ? ` - ${s.nombre}` : '')
  }

  const delSeason = (s) => {
    if (eps.some((e) => Number(e.s) === Number(s.n))) {
      alert('Borra primero los capítulos de esa temporada.')
      return
    }
    if (confirm(`¿Eliminar la temporada ${s.n}?`)) sC.remove(s.id).catch(() => alert('No se pudo borrar.'))
  }

  const card = (e, k, isNew) => (
    <EpisodeCard key={e.id} ep={e} index={k} isNew={isNew} canDelete={isAdmin} onDelete={() => eC.remove(e.id)} />
  )

  const section = NAV.find((n) => n.id === view)

  return (
    <>
      <header className="top">
        <div className="av"><Icon name="rose" /></div>
        <div className="brand">LA <b>ROSANA</b> TV</div>
        {isAdmin && (
          <button className="adm" onClick={() => signOut(auth).then(leaveAdmin)}>Salir</button>
        )}
        <button className="ic" aria-label="Buscar" onClick={() => setSearchOpen(!searchOpen)}>
          <Icon name="search" />
        </button>
      </header>

      {isAdmin && <p className="adminbar">Modo administrador: toca + para agregar temporadas, capítulos y estrenos.</p>}

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
              <Empty icon="rose">
                Aún no hay capítulos.
                {isAdmin && <><br />Toca el botón + para agregar una temporada y su primer capítulo.</>}
              </Empty>
            )}
            <Calendar
              estrenos={rC.items}
              isAdmin={isAdmin}
              onDelete={(id) => rC.remove(id)}
              onAdd={(d) => {
                setRelDate(d)
                setSheet('release')
              }}
            />
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
                  {nums.map((n) => {
                    const sd = seasons.find((x) => Number(x.n) === n)
                    return (
                      <div key={n} className={'chip' + (filter === n ? ' on' : '')}>
                        <button onClick={() => setFilter(n)}>T{n}</button>
                        {isAdmin && sd && (
                          <button className="x" aria-label={`Eliminar temporada ${n}`} onClick={() => delSeason(sd)}>×</button>
                        )}
                      </div>
                    )
                  })}
                </div>
                {(filter === 'all' ? nums : [filter]).map((n) => {
                  const l = filtered.filter((e) => Number(e.s) === n).sort((a, b) => a.e - b.e)
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
              <Empty icon="clap">
                Aún no hay temporadas ni capítulos.
                {isAdmin && <><br />Toca + para agregar la primera temporada.</>}
              </Empty>
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

      {isAdmin && (
        <button className="fab" aria-label="Administrar" onClick={() => setSheet('menu')}>+</button>
      )}

      <nav>
        {NAV.map((n) => (
          <button key={n.id} className={view === n.id ? 'on' : ''} aria-label={n.label} onClick={() => go(n.id)}>
            <Icon name={n.icon} className="nav-ico" />
          </button>
        ))}
      </nav>

      {loginOpen && <LoginModal onClose={leaveAdmin} />}

      {isAdmin && sheet === 'menu' && (
        <AdminMenu
          onClose={() => setSheet(null)}
          onPick={(id) => {
            if (id === 'release') setRelDate('')
            setSheet(id)
          }}
        />
      )}
      {isAdmin && sheet === 'season' && (
        <SeasonModal
          seasons={seasons}
          onClose={() => setSheet(null)}
          onSave={(d) => run(() => sC.add(d), () => { setFilter('all'); go('capitulos') })}
        />
      )}
      {isAdmin && sheet === 'episode' && (
        <EpisodeModal
          seasons={seasons}
          episodes={eps}
          defaultSeason={typeof filter === 'number' ? filter : undefined}
          onClose={() => setSheet(null)}
          onSave={(d) => run(() => eC.add(d), () => { setFilter(d.s); go('capitulos') })}
        />
      )}
      {isAdmin && sheet === 'release' && (
        <ReleaseModal
          seasons={seasons}
          defaultDate={relDate}
          onClose={() => setSheet(null)}
          onSave={(d) => run(() => rC.add(d))}
        />
      )}
    </>
  )
}
