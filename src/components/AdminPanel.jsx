import { useState } from 'react'
import Icon from './Icon.jsx'
import Empty from './Empty.jsx'
import SeasonModal from './SeasonModal.jsx'
import EpisodeModal from './EpisodeModal.jsx'
import ReleaseModal from './ReleaseModal.jsx'
import { fmtDay } from '../utils/dates.js'
import { explain } from '../utils/errors.js'

const MENU = [
  { id: 'resumen', icon: 'home', label: 'Resumen' },
  { id: 'temporadas', icon: 'film', label: 'Temporadas' },
  { id: 'capitulos', icon: 'play', label: 'Capítulos' },
  { id: 'estrenos', icon: 'cal', label: 'Estrenos' },
]

export default function AdminPanel({ eC, sC, rC, onSite, onLogout }) {
  const [sec, setSec] = useState('resumen')
  const [open, setOpen] = useState(false)
  const [sheet, setSheet] = useState(null)
  const [fs, setFs] = useState('all')

  const eps = eC.items
  const seasons = sC.items
  const rel = [...rC.items].sort((a, b) => (a.f + (a.h || '')).localeCompare(b.f + (b.h || '')))
  const countIn = (n) => eps.filter((e) => Number(e.s) === Number(n)).length

  const pick = (id) => {
    setSec(id)
    setOpen(false)
    window.scrollTo(0, 0)
  }
  const run = async (fn) => {
    try {
      await fn()
      setSheet(null)
    } catch (err) {
      alert(explain(err))
    }
  }
  const del = (coll, id, msg) => confirm(msg) && coll.remove(id).catch((err) => alert(explain(err)))
  const delSeason = (s) => {
    if (countIn(s.n)) return alert('Borra primero los capítulos de esa temporada.')
    del(sC, s.id, `¿Eliminar la temporada ${s.n}?`)
  }

  const epList = eps
    .filter((e) => fs === 'all' || Number(e.s) === Number(fs))
    .sort((a, b) => a.s - b.s || a.e - b.e)

  const code = (r) => (r.s ? `T${r.s}${r.e ? 'E' + String(r.e).padStart(2, '0') : ''}` : '--')

  return (
    <>
      <header className="top">
        <button className="ic" aria-label="Abrir menú" onClick={() => setOpen(true)}>
          <Icon name="menu" />
        </button>
        <div className="brand">PANEL <b>ADMIN</b></div>
        <button className="adm" onClick={onSite}>Ver sitio</button>
      </header>

      {open && (
        <div className="drawer-bg" onClick={() => setOpen(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="dh">
              <div className="av"><Icon name="rose" /></div>
              <div><b>Administrador</b><small>LA ROSANA TV</small></div>
            </div>
            {MENU.map((m, i) => (
              <button key={m.id} className={'mi' + (sec === m.id ? ' on' : '')} style={{ '--i': i }} onClick={() => pick(m.id)}>
                <Icon name={m.icon} /> {m.label}
              </button>
            ))}
            <hr />
            <button className="mi" style={{ '--i': 4 }} onClick={onSite}><Icon name="eye" /> Ver sitio</button>
            <button className="mi" style={{ '--i': 5 }} onClick={onLogout}><Icon name="out" /> Cerrar sesión</button>
          </aside>
        </div>
      )}

      <main key={sec} className="view">
        {sec === 'resumen' && (
          <>
            <h2>Resumen</h2>
            <div className="stats">
              {[['Temporadas', seasons.length, 'temporadas'], ['Capítulos', eps.length, 'capitulos'], ['Estrenos', rel.length, 'estrenos']].map(([l, n, id], i) => (
                <button key={id} className="stat" style={{ '--i': i }} onClick={() => pick(id)}>
                  <b>{n}</b><span>{l}</span>
                </button>
              ))}
            </div>
            <button className="act" style={{ '--i': 3 }} onClick={() => setSheet('season')}><Icon name="film" /> Agregar temporada</button>
            <button className="act" style={{ '--i': 4 }} onClick={() => setSheet('episode')}><Icon name="play" /> Agregar capítulo</button>
            <button className="act" style={{ '--i': 5 }} onClick={() => setSheet('release')}><Icon name="cal" /> Agregar estreno al calendario</button>
          </>
        )}

        {sec === 'temporadas' && (
          <>
            <h2>Temporadas</h2>
            {seasons.length ? seasons.map((s, i) => (
              <div className="rel" key={s.id} style={{ '--i': i }}>
                <div className="when">T{s.n}</div>
                <div className="info">
                  <b>{s.nombre || `Temporada ${s.n}`}</b>
                  <span>{countIn(s.n)} capítulos</span>
                </div>
                <button className="dots" aria-label="Eliminar temporada" onClick={() => delSeason(s)}>×</button>
              </div>
            )) : <Empty icon="film">Aún no hay temporadas.</Empty>}
            <button className="btn add" onClick={() => setSheet('season')}>+ Agregar temporada</button>
          </>
        )}

        {sec === 'capitulos' && (
          <>
            <h2>Capítulos</h2>
            <select className="sel" value={fs} onChange={(e) => setFs(e.target.value)}>
              <option value="all">Todas las temporadas</option>
              {seasons.map((s) => <option key={s.id} value={s.n}>Temporada {s.n}</option>)}
            </select>
            {epList.length ? epList.map((e, i) => (
              <div className="rel" key={e.id} style={{ '--i': i }}>
                <div className="when">{code(e)}</div>
                <div className="info">
                  <b>{e.t}</b>
                  {e.d && <span>{e.d}</span>}
                </div>
                <button className="dots" aria-label="Eliminar capítulo" onClick={() => del(eC, e.id, '¿Eliminar este capítulo?')}>×</button>
              </div>
            )) : <Empty icon="clap">No hay capítulos todavía.</Empty>}
            <button className="btn add" onClick={() => setSheet('episode')}>+ Agregar capítulo</button>
          </>
        )}

        {sec === 'estrenos' && (
          <>
            <h2>Estrenos</h2>
            {rel.length ? rel.map((r, i) => (
              <div className="rel" key={r.id} style={{ '--i': i }}>
                <div className="when">{code(r)}</div>
                <div className="info">
                  <b>{r.t}</b>
                  <span>{fmtDay(r.f)}{r.h ? ` - ${r.h}` : ''}</span>
                </div>
                <button className="dots" aria-label="Eliminar estreno" onClick={() => del(rC, r.id, '¿Eliminar este estreno?')}>×</button>
              </div>
            )) : <Empty icon="cal">No hay estrenos programados.</Empty>}
            <button className="btn add" onClick={() => setSheet('release')}>+ Agregar estreno</button>
          </>
        )}
      </main>

      {sheet === 'season' && (
        <SeasonModal seasons={seasons} onClose={() => setSheet(null)} onSave={(d) => run(() => sC.add(d))} />
      )}
      {sheet === 'episode' && (
        <EpisodeModal
          seasons={seasons}
          episodes={eps}
          defaultSeason={fs !== 'all' ? Number(fs) : undefined}
          onClose={() => setSheet(null)}
          onSave={(d) => run(() => eC.add(d))}
        />
      )}
      {sheet === 'release' && (
        <ReleaseModal seasons={seasons} defaultDate="" onClose={() => setSheet(null)} onSave={(d) => run(() => rC.add(d))} />
      )}
    </>
  )
}
