import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import EpisodeCard from './EpisodeCard.jsx'
import useMedia from '../hooks/useMedia.js'
import { parseSource } from '../utils/source.js'
import { byNumber } from '../utils/sort.js'

const SPEEDS = [1, 1.25, 1.5, 2, 0.75]
const go = (id) => {
  window.location.hash = id ? '#/ver/' + id : '#/'
}
const fmt = (s) => {
  if (!isFinite(s)) return '0:00'
  s = Math.floor(s)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const x = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${x}` : `${m}:${x}`
}
const codeOf = (e) => `T${e.s || 1}E${String(e.e || 1).padStart(2, '0')}`

export default function Player({ ep, eps, loaded, onBack }) {
  const root = useRef(null)
  const vid = useRef(null)
  const timer = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)
  const [rate, setRate] = useState(1)
  const [fs, setFs] = useState(false)
  const [hide, setHide] = useState(false)
  const [err, setErr] = useState(false)
  // Horizontal (teléfono girado): panel de cristal. Vertical: ficha del capítulo.
  const land = useMedia('(orientation: landscape) and (max-height: 600px)')
  const L = land || fs

  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      clearTimeout(timer.current)
    }
  }, [])

  if (!ep) {
    return (
      <div className="pl p">
        <div className="meta">
          <button className="rb" aria-label="Volver" onClick={onBack}><Icon name="back" /></button>
          <p className="note">{loaded ? 'No se encontró este capítulo.' : 'Cargando...'}</p>
        </div>
      </div>
    )
  }

  const src = parseSource(ep.u)
  const sorted = [...eps].sort(byNumber)
  const idx = sorted.findIndex((x) => x.id === ep.id)
  const upcoming = sorted.slice(idx + 1, idx + 4)
  const next = upcoming[0]
  const pct = dur ? (cur / dur) * 100 : 0

  const wake = () => {
    setHide(false)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setHide(true), 3000)
  }
  const toggle = () => {
    const v = vid.current
    if (!v) return
    if (v.paused) v.play().catch(() => setErr(true))
    else v.pause()
    wake()
  }
  const skipBy = (d) => {
    const v = vid.current
    if (v) v.currentTime = Math.max(0, Math.min(dur || v.duration || 0, v.currentTime + d))
    wake()
  }
  const cycle = () => {
    const r = SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length]
    setRate(r)
    if (vid.current) vid.current.playbackRate = r
  }
  const toggleFs = async () => {
    const el = root.current
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        screen.orientation?.unlock?.()
      } else if (el.requestFullscreen) {
        await el.requestFullscreen()
        await screen.orientation?.lock?.('landscape')
      } else if (vid.current?.webkitEnterFullscreen) {
        vid.current.webkitEnterFullscreen()
      }
    } catch {}
  }

  const code = codeOf(ep)
  const isVideo = src.type === 'video' && !err

  return (
    <div ref={root} className={`pl ${L ? 'l' : 'p'}${hide && playing ? ' hide' : ''}`}>
      <div className="stage" onPointerMove={wake} onPointerDown={wake}>
        {src.type === 'video' && (
          <video
            ref={vid}
            src={src.src}
            playsInline
            preload="metadata"
            poster={ep.img || undefined}
            onTimeUpdate={(e) => setCur(e.target.currentTime)}
            onLoadedMetadata={(e) => setDur(e.target.duration)}
            onPlay={() => { setPlaying(true); wake() }}
            onPause={() => setPlaying(false)}
            onEnded={() => next && go(next.id)}
            onError={() => setErr(true)}
          />
        )}
        {src.type === 'iframe' && (
          <iframe src={src.src} title={ep.t} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        )}
        {(src.type === 'none' || err) && (
          <div className="pmsg">
            {err
              ? 'No se pudo reproducir este enlace. Usa un enlace directo (.mp4) o uno de YouTube, Vimeo o Google Drive.'
              : 'Este capítulo aún no tiene video.'}
          </div>
        )}

        <div className="pbar ov">
          <button className="rb" aria-label="Volver" onClick={onBack}><Icon name="back" /></button>
          <div className="pt"><b>{ep.t}</b><span>{code}</span></div>
          {isVideo && ep.si > cur && (
            <button className="skip" onClick={() => { vid.current.currentTime = ep.si }}>Saltar intro</button>
          )}
        </div>

        {isVideo && (
          <>
            {!playing && (
              <button className="cplay" aria-label="Reproducir" onClick={toggle}>
                <Icon name="play" className="ico fill" />
              </button>
            )}
            <div className="dock ov">
              <button className="rb dk-play" aria-label={playing ? 'Pausa' : 'Reproducir'} onClick={toggle}>
                <Icon name={playing ? 'pause' : 'play'} className="ico fill" />
              </button>
              <button className="rb only-l" aria-label="Retroceder 10 segundos" onClick={() => skipBy(-10)}>
                <Icon name="back10" />
              </button>
              <button className="rb only-l" aria-label="Adelantar 10 segundos" onClick={() => skipBy(10)}>
                <Icon name="fwd10" />
              </button>
              <span className="tm">{fmt(cur)}</span>
              <input
                className="seek"
                type="range"
                min="0"
                max={dur || 0}
                step="0.1"
                value={cur}
                style={{ '--p': pct + '%' }}
                aria-label="Progreso"
                onChange={(e) => {
                  if (vid.current) vid.current.currentTime = Number(e.target.value)
                  setCur(Number(e.target.value))
                  wake()
                }}
              />
              <span className="tm">{fmt(dur)}</span>
              <button className="rb only-l rate" aria-label="Velocidad" onClick={cycle}>{rate}x</button>
              <button className="rb" aria-label="Pantalla completa" onClick={toggleFs}>
                <Icon name="full" />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="meta">
        <h1>{ep.t}</h1>
        <div className="sub">{code}{ep.d ? ` - ${ep.d}` : ''}</div>
        <div className="chipsrow">
          {isVideo && <button className="chipb" onClick={cycle}>Velocidad {rate}x</button>}
          <button className="chipb" onClick={toggleFs}>Pantalla completa</button>
        </div>
        {upcoming.length > 0 && (
          <>
            <h4 className="dayh">Siguientes capítulos</h4>
            {upcoming.map((e, k) => <EpisodeCard key={e.id} ep={e} index={k} />)}
          </>
        )}
      </div>
    </div>
  )
}
