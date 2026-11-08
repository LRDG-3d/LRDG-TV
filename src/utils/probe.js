// Detecta duración y miniatura a partir del enlace del video
import { API_KEY } from '../firebase'

const YT_RE = /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/
const VM_RE = /vimeo\.com\/(\d+)/
const DR_RE = /drive\.google\.com\/file\/d\/([\w-]+)/

export function formatDuration(sec) {
  sec = Math.round(sec)
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = String(sec % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

const withTimeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))])

// Devuelve el primer resultado válido de varias fuentes en paralelo
const firstTruthy = (ps) =>
  new Promise((res) => {
    let left = ps.length
    const miss = () => --left === 0 && res(null)
    ps.forEach((p) => p.then((v) => (v ? res(v) : miss())).catch(miss))
  })

export function drawToJpeg(src, w, h) {
  const c = document.createElement('canvas')
  c.width = 640
  c.height = 360
  const r = Math.max(640 / w, 360 / h)
  c.getContext('2d').drawImage(src, (640 - w * r) / 2, (360 - h * r) / 2, w * r, h * r)
  return c.toDataURL('image/jpeg', 0.72)
}

export function fileToThumb(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file)
    const im = new Image()
    im.onload = () => {
      try {
        res(drawToJpeg(im, im.naturalWidth, im.naturalHeight))
      } catch (e) {
        rej(e)
      }
      URL.revokeObjectURL(url)
    }
    im.onerror = rej
    im.src = url
  })
}

// Video oculto dentro de la página (en el teléfono, uno suelto a veces no carga)
function hiddenVideo(extra) {
  const v = document.createElement('video')
  v.muted = true
  v.playsInline = true
  v.preload = 'auto'
  if (extra) extra(v)
  v.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none'
  document.body.appendChild(v)
  return v
}

function videoDuration(url) {
  return new Promise((res) => {
    const v = hiddenVideo()
    const end = (d) => {
      v.remove()
      res(d)
    }
    v.onloadedmetadata = () => end(isFinite(v.duration) && v.duration > 0 ? v.duration : null)
    v.onerror = () => end(null)
    v.src = url
    v.load()
  })
}

// Fotograma del video (solo si el servidor permite CORS)
function videoFrame(url) {
  return new Promise((res) => {
    const v = hiddenVideo((x) => (x.crossOrigin = 'anonymous'))
    const end = (i) => {
      v.remove()
      res(i)
    }
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(5, (v.duration || 10) * 0.1)
    }
    v.onseeked = () => {
      try {
        end(drawToJpeg(v, v.videoWidth, v.videoHeight))
      } catch {
        end(null)
      }
    }
    v.onerror = () => end(null)
    v.src = url
    v.load()
  })
}

// YouTube: API de datos (si está activada en el proyecto)
async function ytApiDuration(id) {
  try {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=${API_KEY}`)
    if (!r.ok) return null
    const iso = (await r.json()).items?.[0]?.contentDetails?.duration
    const m = iso && iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    return m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : null
  } catch {
    return null
  }
}

// YouTube: reproductor invisible que lee la duración
let ytReady
function loadYT() {
  if (window.YT?.Player) return Promise.resolve()
  if (ytReady) return ytReady
  ytReady = new Promise((res) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      res()
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(s)
  })
  return ytReady
}

async function youtubeDuration(id) {
  await loadYT()
  return new Promise((res) => {
    const holder = document.createElement('div')
    holder.style.cssText = 'position:fixed;left:0;top:0;width:200px;height:120px;opacity:0;pointer-events:none;z-index:-1'
    const inner = document.createElement('div')
    holder.appendChild(inner)
    document.body.appendChild(holder)
    let player
    const done = (v) => {
      try {
        player?.destroy()
      } catch {}
      holder.remove()
      res(v)
    }
    player = new window.YT.Player(inner, {
      videoId: id,
      playerVars: { controls: 0, playsinline: 1 },
      events: {
        onReady: () => {
          try {
            player.mute()
            player.playVideo()
          } catch {}
          let n = 0
          const t = setInterval(() => {
            const d = player.getDuration?.()
            if (d > 0) {
              clearInterval(t)
              done(d)
            } else if (++n > 30) {
              clearInterval(t)
              done(null)
            }
          }, 300)
        },
        onError: () => done(null),
      },
    })
  })
}

// onUpdate recibe lo que se vaya encontrando (la miniatura sale antes que la duración)
export async function probe(url, onUpdate = () => {}) {
  const out = { dur: null, img: null }
  const upd = (p) => {
    Object.assign(out, p)
    onUpdate({ ...out })
  }

  const yt = url.match(YT_RE)
  if (yt) {
    upd({ img: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg` })
    const d = await withTimeout(firstTruthy([ytApiDuration(yt[1]), youtubeDuration(yt[1])]), 12000)
    if (d) upd({ dur: d })
    return out
  }

  const vm = url.match(VM_RE)
  if (vm) {
    try {
      const r = await fetch('https://vimeo.com/api/oembed.json?url=' + encodeURIComponent('https://vimeo.com/' + vm[1]))
      const j = await r.json()
      upd({ dur: j.duration || null, img: j.thumbnail_url || null })
    } catch {}
    return out
  }

  const dr = url.match(DR_RE)
  if (dr) {
    upd({ img: `https://drive.google.com/thumbnail?id=${dr[1]}&sz=w640` })
    return out
  }

  await Promise.all([
    withTimeout(videoDuration(url), 12000).then((d) => d && upd({ dur: d })),
    withTimeout(videoFrame(url), 12000).then((i) => i && upd({ img: i })),
  ])
  return out
}
