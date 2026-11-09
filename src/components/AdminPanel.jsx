import { useState } from 'react'
import Icon from './Icon.jsx'
import Empty from './Empty.jsx'
import SeasonModal from './SeasonModal.jsx'
import EpisodeModal from './EpisodeModal.jsx'
import ReleaseModal from './ReleaseModal.jsx'
import { fmtDay } from '../utils/dates.js'
import { explain } from '../utils/errors.js'
import { byNumber } from '../utils/sort.js'
import { probe, formatDuration } from '../utils/probe.js'

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
  const [edit, setEdit] = useState(null)
  const [prog, setProg] = useState('')

  const eps = eC.items
  const seasons = sC.items
  const rel = [...rC.items].sort((a, b) => (a.f + (a.h || '')).localeCompare(b.f + (b.h || '')))
  const countIn = (n) => eps.filter((e) => Number(e.s) === Number(n)).length

  const pick = (id) => {
    setSec(id)
    setOpen(false)
    window.scrollTo(0, 0)
  }
  const run = async (fn, after) => {
    try {
      await fn()
      setSheet(null)
      after?.()
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
    .sort(byNumber)

  const scanAll = async () => {
    const todo = epList.filter((x) => x.u && (!x.d || !x.img))
    if (!todo.length) return alert('Todos los capítulos ya tienen duración y miniatura.')
    let ok = 0
    for (let i = 0; i < todo.length; i++) {
      setProg(`Escaneando ${i + 1} de ${todo.length}...`)
      const x = todo[i]
      const r = await probe(x.u)
      const patch = {}
      if (!x.d && r.dur) patch.d = formatDuration(r.dur)
      if (!x.img && r.img) patch.img = r.img
      if (Object.keys(patch).length) {
        try {
          await eC.update(x.id, patch)
          ok++
        } catch (err) {
          setProg('')
          return alert(explain(err))
        }
      }
    }
    setProg('')
    alert(`Listo: se actualizaron ${ok} de ${todo.length} capítulos.`)
  }

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
                {e.img && <div className="rthumb" style={{ backgroundImage: `url("${e.img}")` }} />}
                <div className="info">
                  <b>{e.t}</b>
                  <span>{e.d || 'Sin duración'}</span>
                </div>
                <button className="dots" aria-label="Editar capítulo" onClick={() => setEdit(e)}><Icon name="edit" /></button>
                <button className="dots" aria-label="Eliminar capítulo" onClick={() => del(eC, e.id, '¿Eliminar este capítulo?')}>×</button>
              </div>
            )) : <Empty icon="clap">No hay capítulos todavía.</Empty>}
            <button className="btn add" onClick={() => setSheet('episode')}>+ Agregar capítulo</button>
            <button className="btn g add" disabled={!!prog} onClick={scanAll}>{prog || 'Escanear todos (duración y miniatura)'}</button>
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
      {edit && (
        <EpisodeModal
          seasons={seasons}
          episodes={eps}
          initial={edit}
          onClose={() => setEdit(null)}
          onSave={(d) => run(() => eC.update(edit.id, d), () => setEdit(null))}
        />
      )}
      {sheet === 'release' && (
        <ReleaseModal seasons={seasons} defaultDate="" onClose={() => setSheet(null)} onSave={(d) => run(() => rC.add(d))} />
      )}
    </>
  )
}
