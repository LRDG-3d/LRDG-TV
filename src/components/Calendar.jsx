import { useState } from 'react'
import Empty from './Empty.jsx'
import Icon from './Icon.jsx'
import { ymd, fmtDay } from '../utils/dates.js'

const WD = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const byTime = (a, b) => (a.f + (a.h || '')).localeCompare(b.f + (b.h || ''))

function Item({ r, i, isAdmin, onDelete }) {
  const code = r.s ? `T${r.s}${r.e ? 'E' + String(r.e).padStart(2, '0') : ''}` : ''
  return (
    <div className="rel" style={{ '--i': i }}>
      <div className="when">{r.h || 'Todo el día'}</div>
      <div className="info">
        <b>{r.t}</b>
        {code && <span>{code}</span>}
      </div>
      {isAdmin && (
        <button
          className="dots"
          aria-label="Eliminar estreno"
          onClick={() => confirm('¿Eliminar este estreno?') && onDelete(r.id)}
        >
          ×
        </button>
      )}
    </div>
  )
}

export default function Calendar({ estrenos, isAdmin, onDelete, onAdd }) {
  const today = ymd(new Date())
  const [tab, setTab] = useState('todas')
  const [cur, setCur] = useState(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })
  const [sel, setSel] = useState(today)

  const sorted = [...estrenos].sort(byTime)
  const hoy = sorted.filter((r) => r.f === today)
  const prox = sorted.filter((r) => r.f >= today)
  const groups = prox.reduce((a, r) => {
    ;(a[r.f] = a[r.f] || []).push(r)
    return a
  }, {})

  const now = new Date()
  const gmt = -now.getTimezoneOffset() / 60
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const move = (d) =>
    setCur(({ y, m }) => {
      const n = new Date(y, m + d, 1)
      return { y: n.getFullYear(), m: n.getMonth() }
    })

  const offset = (new Date(cur.y, cur.m, 1).getDay() + 6) % 7
  const days = new Date(cur.y, cur.m + 1, 0).getDate()
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const monthName = new Date(cur.y, cur.m, 1).toLocaleDateString('es', { month: 'long', year: 'numeric' })
  const daySel = sorted.filter((r) => r.f === sel)

  const list = (arr) =>
    arr.map((r, i) => <Item key={r.id} r={r} i={i} isAdmin={isAdmin} onDelete={onDelete} />)

  return (
    <section className="cal">
      <h3>Calendario de estrenos</h3>
      <small>
        GMT{gmt >= 0 ? '+' : ''}{gmt} (Tu zona horaria) • Actualizado a las {hhmm}
      </small>

      <div className="tabs">
        <button className={'tab' + (tab === 'hoy' ? ' on' : '')} onClick={() => setTab('hoy')}>
          Hoy <span className="n">{hoy.length}</span>
        </button>
        <button className={'tab' + (tab === 'todas' ? ' on' : '')} onClick={() => setTab('todas')}>
          <Icon name="cal" /> Todas las fechas <span className="n">{prox.length}</span>
        </button>
        <button className={'tab' + (tab === 'mes' ? ' on' : '')} onClick={() => setTab('mes')}>
          Mes
        </button>
      </div>

      <div className="fade" key={tab}>
        {tab === 'hoy' &&
          (hoy.length ? list(hoy) : <Empty icon="cal">No hay estrenos hoy.</Empty>)}

        {tab === 'todas' &&
          (prox.length ? (
            Object.keys(groups).sort().map((f) => (
              <div key={f}>
                <h4 className="dayh">{fmtDay(f)}</h4>
                {list(groups[f])}
              </div>
            ))
          ) : (
            <Empty icon="cal">No hay estrenos programados por ahora.</Empty>
          ))}

        {tab === 'mes' && (
          <>
            <div className="month">
              <button className="more" aria-label="Mes anterior" onClick={() => move(-1)}>‹</button>
              <b>{monthName}</b>
              <button className="more" aria-label="Mes siguiente" onClick={() => move(1)}>›</button>
            </div>
            <div className="grid">
              {WD.map((w) => <span key={w} className="wd">{w}</span>)}
              {cells.map((d, i) => {
                if (!d) return <span key={'e' + i} />
                const f = ymd(new Date(cur.y, cur.m, d))
                const cls = ['day', f === today && 'today', f === sel && 'sel', sorted.some((r) => r.f === f) && 'has']
                  .filter(Boolean).join(' ')
                return (
                  <button key={f} className={cls} onClick={() => setSel(f)}>{d}</button>
                )
              })}
            </div>
            <h4 className="dayh">{fmtDay(sel)}</h4>
            {daySel.length ? list(daySel) : <p className="note">Sin estrenos este día.</p>}
          </>
        )}
      </div>

      {isAdmin && (
        <button className="btn add" onClick={() => onAdd(tab === 'mes' ? sel : '')}>
          + Agregar estreno
        </button>
      )}
    </section>
  )
}
