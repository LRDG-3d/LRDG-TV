import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'
import Icon from './components/Icon.jsx'
import Empty from './components/Empty.jsx'
import EpisodeCard from './components/EpisodeCard.jsx'
import Calendar from './components/Calendar.jsx'
import AddModal from './components/AddModal.jsx'
import LoginModal from './components/LoginModal.jsx'
import useEpisodes from './hooks/useEpisodes.js'
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
  const { eps, add, remove } = useEpisodes()
  const user = useAdmin()
  const hash = useHash()
  const [view, setView] = useState('inicio')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [modal, setModal] = useState(false)

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

  const items = eps
    .map((ep, i) => ({ ep, i }))
    .filter((x) => x.ep.t.toLowerCase().includes(query.toLowerCase()))
    .reverse()

  const list = (arr) =>
    arr.map((x, k) => (
      <EpisodeCard
        key={x.ep.id}
        ep={x.ep}
        isNew={k === 0 && !query}
        canDelete={isAdmin}
        onDelete={() => remove(x.ep.id)}
      />
    ))

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

      {isAdmin && <p className="adminbar">Modo administrador: puedes agregar y borrar capítulos.</p>}

      {searchOpen && (
        <input
          id="q"
          autoFocus
          placeholder="Buscar capítulos..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (view === 'inicio') go('capitulos')
          }}
        />
      )}

      <main>
        {view === 'inicio' && (
          <>
            <h2>
              Añadidos recientemente
              <button className="more" aria-label="Ver todos" onClick={() => go('capitulos')}>›</button>
            </h2>
            {items.length ? list(items.slice(0, 6)) : (
              <Empty icon="rose">
                Aún no hay capítulos.
                {isAdmin && <><br />Toca el botón + para agregar el primero.</>}
              </Empty>
            )}
            <Calendar />
          </>
        )}

        {view === 'capitulos' && (
          <>
            <h2>Todos los capítulos</h2>
            {items.length ? list(items) : <Empty icon="clap">No hay capítulos todavía.</Empty>}
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
        <button className="fab" aria-label="Agregar capítulo" onClick={() => setModal(true)}>+</button>
      )}

      <nav>
        {NAV.map((n) => (
          <button key={n.id} className={view === n.id ? 'on' : ''} aria-label={n.label} onClick={() => go(n.id)}>
            <Icon name={n.icon} className="nav-ico" />
          </button>
        ))}
      </nav>

      <AddModal
        open={modal}
        nextEpisode={eps.length + 1}
        onClose={() => setModal(false)}
        onSave={async (ep) => {
          try {
            await add(ep)
            setModal(false)
            go('inicio')
          } catch {
            alert('No se pudo guardar. Revisa que hayas iniciado sesión con el correo admin.')
          }
        }}
      />
      <LoginModal open={loginOpen} onClose={leaveAdmin} />
    </>
  )
}
