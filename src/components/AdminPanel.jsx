import { useState } from 'react'
import Icon from './Icon.jsx'
import Empty from './Empty.jsx'
import SerieModal from './SerieModal.jsx'
import CategoriaModal from './CategoriaModal.jsx'
import SeasonModal from './SeasonModal.jsx'
import EpisodeModal from './EpisodeModal.jsx'
import ReleaseModal from './ReleaseModal.jsx'
import { fmtDay } from '../utils/dates.js'
import { explain } from '../utils/errors.js'
import { probe, formatDuration } from '../utils/probe.js'
import { byNumber } from '../utils/sort.js'

const SIZE = { normal: 'mediano', mediano: 'mediano', grande: 'grande', muygrande: 'muy grande' }

const MENU = [
  { id: 'resumen', icon: 'home', label: 'Resumen' },
  { id: 'series', icon: 'film', label: 'Series' },
  { id: 'categorias', icon: 'news', label: 'Categorías' },
  { id: 'temporadas', icon: 'play', label: 'Temporadas' },
  { id: 'capitulos', icon: 'clap', label: 'Capítulos' },
  { id: 'estrenos', icon: 'cal', label: 'Estrenos' },
]

export default function AdminPanel({ serC, catC, sC, eC, rC, onSite, onLogout }) {
  const [sec, setSec] = useState('resumen')
  const [open, setOpen] = useState(false)
  const [sheet, setSheet] = useState(null) // season | episode | release
  const [serieM, setSerieM] = useState(null) // null | 'new' | serie
  const [fs, setFs] = useState('all')
  const [edit, setEdit] = useState(null)
  const [prog, setProg] = useState('')
  const [sidSel, setSidSel] = useState('')
  const [asg, setAsg] = useState('')
  const [catM, setCatM] = useState(null)
  const cats = catC.items
  const nextOrden = cats.reduce((m, c) => Math.max(m, c.orden || 0), 0) + 1
  const moveCat = async (i, d) => {
    const j = i + d
    if (j < 0 || j >= cats.length) return
    try {
      await catC.update(cats[i].id, { orden: cats[j].orden })
      await catC.update(cats[j].id, { orden: cats[i].orden })
    } catch (err) {
      alert(explain(err))
    }
  }

  const series = serC.items
  const sid = series.some((x) => x.id === sidSel) ? sidSel : series[0]?.id || ''
  const seasons = sC.items.filter((x) => x.serie === sid)
  const eps = eC.items.filter((x) => x.serie === sid)
  const rel = rC.items
    .filter((x) => x.serie === sid)
    .sort((a, b) => (a.f + (a.h || '')).localeCompare(b.f + (b.h || '')))
  const orphans = [
    ...sC.items.filter((x) => !x.serie).map((x) => [sC, x]),
    ...eC.items.filter((x) => !x.serie).map((x) => [eC, x]),
    ...rC.items.filter((x) => !x.serie).map((x) => [rC, x]),
  ]
  const countIn = (n) => eps.filter((e) => Number(e.s) === Number(n)).length
  const countSerie = (coll, id) => coll.items.filter((x) => x.serie === id).length

  const pick = (id) => {
    setSec(id)
    setOpen(false)
    window.scrollTo(0, 0)
  }
  const needSerie = () => {
    if (!series.length) {
      alert('Primero agrega una serie.')
      return false
    }
    return true
  }
  const openSheet = (id) => needSerie() && setSheet(id)
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
  const delSerie = (s) => {
    if (countSerie(sC, s.id) + countSerie(eC, s.id) + countSerie(rC, s.id)) {
      return alert('Borra primero las temporadas, capítulos y estrenos de esa serie.')
    }
    del(serC, s.id, `¿Eliminar la serie "${s.nombre}"?`)
  }
  const assign = async () => {
    const target = asg || series[0].id
    try {
      for (const [c, x] of orphans) await c.update(x.id, { serie: target })
    } catch (err) {
      alert(explain(err))
    }
  }

  const epList = eps.filter((e) => fs === 'all' || Number(e.s) === Number(fs)).sort(byNumber)

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

  const serieBar = series.length ? (
    <select
      className="sel"
      aria-label="Serie"
      value={sid}
      onChange={(e) => {
        setSidSel(e.target.value)
        setFs('all')
      }}
    >
      {series.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
    </select>
  ) : null
  const noSerie = <Empty icon="film">Primero agrega una serie en la sección Series.</Empty>

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
              <div className="av logo"><img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="LA ROSANA TV" /></div>
              <div><b>Administrador</b><small>LA ROSANA TV</small></div>
            </div>
            {MENU.map((m, i) => (
              <button key={m.id} className={'mi' + (sec === m.id ? ' on' : '')} style={{ '--i': i }} onClick={() => pick(m.id)}>
                <Icon name={m.icon} /> {m.label}
              </button>
            ))}
            <hr />
            <button className="mi" style={{ '--i': 5 }} onClick={onSite}><Icon name="eye" /> Ver sitio</button>
            <button className="mi" style={{ '--i': 6 }} onClick={onLogout}><Icon name="out" /> Cerrar sesión</button>
          </aside>
        </div>
      )}

      <main key={sec} className="view">
        {sec === 'resumen' && (
          <>
            <h2>Resumen</h2>
            <div className="stats">
              {[
                ['Series', series.length, 'series'],
                ['Temporadas', sC.items.length, 'temporadas'],
                ['Capítulos', eC.items.length, 'capitulos'],
                ['Estrenos', rC.items.length, 'estrenos'],
              ].map(([l, n, id], i) => (
                <button key={id} className="stat" style={{ '--i': i }} onClick={() => pick(id)}>
                  <b>{n}</b><span>{l}</span>
                </button>
              ))}
            </div>
            <button className="act" style={{ '--i': 4 }} onClick={() => setSerieM('new')}><Icon name="film" /> Agregar serie</button>
            <button className="act" style={{ '--i': 4 }} onClick={() => (series.length ? setCatM('new') : alert('Primero agrega una serie.'))}><Icon name="news" /> Agregar categoría</button>
            <button className="act" style={{ '--i': 5 }} onClick={() => openSheet('season')}><Icon name="play" /> Agregar temporada</button>
            <button className="act" style={{ '--i': 6 }} onClick={() => openSheet('episode')}><Icon name="clap" /> Agregar capítulo</button>
            <button className="act" style={{ '--i': 7 }} onClick={() => openSheet('release')}><Icon name="cal" /> Agregar estreno al calendario</button>
          </>
        )}

        {sec === 'series' && (
          <>
            <h2>Series</h2>
            {orphans.length > 0 && series.length > 0 && (
              <div className="warn">
                Hay {orphans.length} elementos de antes que no tienen serie. Elige la serie a la que pertenecen:
                <select className="sel" style={{ marginTop: 10 }} value={asg || series[0].id} onChange={(e) => setAsg(e.target.value)}>
                  {series.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
                <button className="btn" style={{ width: '100%' }} onClick={assign}>Asignar a esta serie</button>
              </div>
            )}
            {series.length ? series.map((s, i) => (
              <div className="rel" key={s.id} style={{ '--i': i }}>
                <div className="rthumb cover" style={{ '--c': s.color, ...(s.img ? { backgroundImage: `url("${s.img}")` } : {}) }} />
                <div className="info">
                  <b>{s.nombre}</b>
                  <span>
                    <i className="sdot" style={{ background: s.color }} />
                    {countSerie(sC, s.id)} temporadas - {countSerie(eC, s.id)} capítulos
                  </span>
                </div>
                <button className="dots" aria-label="Editar serie" onClick={() => setSerieM(s)}><Icon name="edit" /></button>
                <button className="dots" aria-label="Eliminar serie" onClick={() => delSerie(s)}>×</button>
              </div>
            )) : <Empty icon="film">Aún no hay series.</Empty>}
            <button className="btn add" onClick={() => setSerieM('new')}>+ Agregar serie</button>
          </>
        )}

        {sec === 'categorias' && (
          <>
            <h2>Categorías</h2>
            <p className="note" style={{ textAlign: 'left' }}>
              Cada categoría es una fila del Inicio. "Seguir viendo" aparece sola arriba.
            </p>
            {cats.length ? cats.map((c, i) => (
              <div className="rel" key={c.id} style={{ '--i': i }}>
                <div className="info">
                  <b>{c.nombre}</b>
                  <span>
                    {(c.series || []).filter((id) => series.some((s) => s.id === id)).length} series - tamaño {SIZE[c.estilo] || 'mediano'}
                  </span>
                </div>
                <button className="dots" aria-label="Subir" disabled={i === 0} onClick={() => moveCat(i, -1)}>↑</button>
                <button className="dots" aria-label="Bajar" disabled={i === cats.length - 1} onClick={() => moveCat(i, 1)}>↓</button>
                <button className="dots" aria-label="Editar categoría" onClick={() => setCatM(c)}><Icon name="edit" /></button>
                <button className="dots" aria-label="Eliminar categoría" onClick={() => del(catC, c.id, `¿Eliminar la categoría "${c.nombre}"?`)}>×</button>
              </div>
            )) : <Empty icon="news">Aún no hay categorías.</Empty>}
            <button className="btn add" onClick={() => (series.length ? setCatM('new') : alert('Primero agrega una serie.'))}>+ Agregar categoría</button>
          </>
        )}

        {sec === 'temporadas' && (
          <>
            <h2>Temporadas</h2>
            {serieBar}
            {!series.length ? noSerie : (
              <>
                {seasons.length ? seasons.map((s, i) => (
                  <div className="rel" key={s.id} style={{ '--i': i }}>
                    <div className="when">T{s.n}</div>
                    <div className="info">
                      <b>{s.nombre || `Temporada ${s.n}`}</b>
                      <span>{countIn(s.n)} capítulos</span>
                    </div>
                    <button className="dots" aria-label="Eliminar temporada" onClick={() => delSeason(s)}>×</button>
                  </div>
                )) : <Empty icon="film">Esta serie aún no tiene temporadas.</Empty>}
                <button className="btn add" onClick={() => openSheet('season')}>+ Agregar temporada</button>
              </>
            )}
          </>
        )}

        {sec === 'capitulos' && (
          <>
            <h2>Capítulos</h2>
            {serieBar}
            {!series.length ? noSerie : (
              <>
                <select className="sel" aria-label="Temporada" value={fs} onChange={(e) => setFs(e.target.value)}>
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
                <button className="btn add" onClick={() => openSheet('episode')}>+ Agregar capítulo</button>
                <button className="btn g add" disabled={!!prog} onClick={scanAll}>{prog || 'Escanear todos (duración y miniatura)'}</button>
              </>
            )}
          </>
        )}

        {sec === 'estrenos' && (
          <>
            <h2>Estrenos</h2>
            {serieBar}
            {!series.length ? noSerie : (
              <>
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
                <button className="btn add" onClick={() => openSheet('release')}>+ Agregar estreno</button>
              </>
            )}
          </>
        )}
      </main>

      {catM && (
        <CategoriaModal
          series={series}
          initial={catM === 'new' ? null : catM}
          onClose={() => setCatM(null)}
          onSave={async (d) => {
            try {
              await (catM === 'new' ? catC.add({ ...d, orden: nextOrden }) : catC.update(catM.id, d))
              setCatM(null)
            } catch (err) {
              alert(explain(err))
            }
          }}
        />
      )}
      {serieM && (
        <SerieModal
          initial={serieM === 'new' ? null : serieM}
          onClose={() => setSerieM(null)}
          onSave={async (d) => {
            try {
              await (serieM === 'new' ? serC.add(d) : serC.update(serieM.id, d))
              setSerieM(null)
            } catch (err) {
              alert(explain(err))
            }
          }}
        />
      )}
      {sheet === 'season' && (
        <SeasonModal seasons={seasons} onClose={() => setSheet(null)} onSave={(d) => run(() => sC.add({ ...d, serie: sid }))} />
      )}
      {sheet === 'episode' && (
        <EpisodeModal
          seasons={seasons}
          episodes={eps}
          defaultSeason={fs !== 'all' ? Number(fs) : undefined}
          onClose={() => setSheet(null)}
          onSave={(d) => run(() => eC.add({ ...d, serie: sid }))}
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
        <ReleaseModal seasons={seasons} defaultDate="" onClose={() => setSheet(null)} onSave={(d) => run(() => rC.add({ ...d, serie: sid }))} />
      )}
    </>
  )
}
