import { useState } from 'react'
import Icon from './Icon.jsx'
import Empty from './Empty.jsx'
import EpisodeCard from './EpisodeCard.jsx'
import Calendar from './Calendar.jsx'
import { byNumber } from '../utils/sort.js'

export default function SeriePage({ serie, seasons, eps, estrenos, seriesMap, onBack }) {
  const [filter, setFilter] = useState('all')
  const nums = [...new Set([...seasons.map((s) => Number(s.n)), ...eps.map((e) => Number(e.s))])].sort((a, b) => a - b)
  const seasonName = (n) => {
    const s = seasons.find((x) => Number(x.n) === n)
    return `Temporada ${n}` + (s?.nombre ? ` - ${s.nombre}` : '')
  }

  return (
    <>
      <header className="top">
        <button className="rb back" aria-label="Volver" onClick={onBack}><Icon name="back" /></button>
        <div className="brand">{serie.nombre}</div>
      </header>

      <main className="view">
        <div className="hero">
          <div className="cover hc" style={{ '--c': serie.color || '#3b82f6', ...(serie.img ? { backgroundImage: `url("${serie.img}")` } : {}) }}>
            {!serie.img && <Icon name="rose" />}
          </div>
          <div className="hi">
            <h1>{serie.nombre}</h1>
            {serie.extra && <div className="sub">{serie.extra}</div>}
            {serie.info && <p className="synopsis">{serie.info}</p>}
            <div className="sub">{eps.length} capítulos</div>
          </div>
        </div>

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
            <div className="fade" key={filter}>
              {(filter === 'all' ? nums : [filter]).map((n) => {
                const l = eps.filter((e) => Number(e.s) === n).sort(byNumber)
                return (
                  <section key={n}>
                    <h4 className="dayh">{seasonName(n)}</h4>
                    {l.length ? l.map((e, k) => <EpisodeCard key={e.id} ep={e} index={k} />) : (
                      <Empty icon="clap">Sin capítulos en esta temporada.</Empty>
                    )}
                  </section>
                )
              })}
            </div>
          </>
        ) : (
          <Empty icon="clap">Esta serie aún no tiene capítulos.</Empty>
        )}

        <Calendar estrenos={estrenos} seriesMap={seriesMap} />
      </main>
    </>
  )
}
