import { useState } from 'react'
import Icon from './Icon.jsx'
import Empty from './Empty.jsx'
import SerieCard from './SerieCard.jsx'
import { byNumber } from '../utils/sort.js'
import { getProgress } from '../utils/progress.js'
import { minutesOf } from '../utils/minutes.js'
import { inList, toggleList } from '../utils/mylist.js'

export default function SeriePage({ serie, seasons, eps, similar = [], onBack }) {
  const nums = [...new Set([...seasons.map((s) => Number(s.n)), ...eps.map((e) => Number(e.s))])].sort((a, b) => a - b)
  const [tab, setTab] = useState('eps')
  const [season, setSeason] = useState(nums[0])
  const [pick, setPick] = useState(false)
  const [mine, setMine] = useState(() => inList(serie.id))
  const prog = getProgress()

  const cur = nums.includes(season) ? season : nums[0]
  const nameOf = (n) => seasons.find((x) => Number(x.n) === n)?.nombre
  const list = eps.filter((e) => Number(e.s) === cur).sort(byNumber)

  const nT = nums.length
  const nE = eps.length
  const meta = [
    serie.extra,
    nT ? `${nT} ${nT === 1 ? 'temporada' : 'temporadas'}` : null,
    `${nE} ${nE === 1 ? 'episodio' : 'episodios'}`,
  ].filter(Boolean).join(' · ')

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
            <div className="sub">{meta}</div>
            {serie.info && <p className="synopsis">{serie.info}</p>}
          </div>
        </div>

        <button className={'mylist' + (mine ? ' on' : '')} onClick={() => setMine(toggleList(serie.id))}>
          <Icon name={mine ? 'check' : 'plus'} />
          <span>{mine ? 'EN MI LISTA' : 'MI LISTA'}</span>
        </button>

        <div className="stabs" role="tablist">
          <button role="tab" aria-selected={tab === 'eps'} className={tab === 'eps' ? 'on' : ''} onClick={() => setTab('eps')}>EPISODIOS</button>
          <button role="tab" aria-selected={tab === 'sim'} className={tab === 'sim' ? 'on' : ''} onClick={() => setTab('sim')}>SIMILARES</button>
        </div>

        <div className="fade" key={tab + cur}>
          {tab === 'eps' && (
            nums.length ? (
              <>
                <button className="seasonh" disabled={nT < 2} onClick={() => setPick(true)}>
                  <span>Temporada {cur}{nameOf(cur) ? ` - ${nameOf(cur)}` : ''}</span>
                  {nT > 1 && <Icon name="chev" />}
                </button>
                {list.length ? list.map((e, k) => {
                  const p = prog[e.id]
                  const frac = p && p.dur ? Math.min(1, p.pos / p.dur) : 0
                  const m = minutesOf(e.d)
                  return (
                    <button
                      key={e.id}
                      className="erow"
                      style={{ '--i': k, '--p': frac * 100 }}
                      onClick={() => { window.location.hash = '#/ver/' + e.id }}
                    >
                      <span className="ring"><Icon name="play" className="ico fill" /></span>
                      <span className="einfo">
                        <b>{e.e} · {e.t}</b>
                        {m > 0 && <span>{m} MIN</span>}
                      </span>
                    </button>
                  )
                }) : <Empty icon="clap">Sin capítulos en esta temporada.</Empty>}
              </>
            ) : (
              <Empty icon="clap">Esta serie aún no tiene capítulos.</Empty>
            )
          )}

          {tab === 'sim' && (
            similar.length ? (
              <div className="sgrid" style={{ marginTop: 16 }}>
                {similar.map((s, i) => <SerieCard key={s.id} serie={s} index={i} />)}
              </div>
            ) : (
              <Empty icon="film">No hay series similares todavía.</Empty>
            )
          )}
        </div>
      </main>

      {pick && (
        <div className="modal" onClick={(e) => e.target === e.currentTarget && setPick(false)}>
          <div className="box">
            <h3>Temporadas</h3>
            {nums.map((n, i) => (
              <button key={n} className="act" style={{ '--i': i }} onClick={() => { setSeason(n); setPick(false) }}>
                Temporada {n}{nameOf(n) ? ` - ${nameOf(n)}` : ''}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
