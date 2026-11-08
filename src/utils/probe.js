// Detecta duración y miniatura a partir del enlace del video

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

const withTimeout = (p, ms = 15000) =>
  Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))])

// Dibuja una imagen o un fotograma en 640x360 y lo devuelve como JPEG
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

function videoDuration(url) {
  return new Promise((res) => {
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.muted = true
    v.onloadedmetadata = () => {
      res(isFinite(v.duration) ? v.duration : null)
      v.removeAttribute('src')
      v.load()
    }
    v.onerror = () => res(null)
    v.src = url
  })
}

// Fotograma del video (solo si el servidor permite CORS)
function videoFrame(url) {
  return new Promise((res) => {
    const v = document.createElement('video')
    v.crossOrigin = 'anonymous'
    v.preload = 'auto'
    v.muted = true
    v.playsInline = true
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(5, (v.duration || 10) * 0.1)
    }
    v.onseeked = () => {
      try {
        res(drawToJpeg(v, v.videoWidth, v.videoHeight))
      } catch {
        res(null)
      }
    }
    v.onerror = () => res(null)
    v.src = url
  })
}

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
    holder.style.cssText = 'position:fixed;left:-9999px;top:0;width:200px;height:120px'
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
      playerVars: { controls: 0 },
      events: {
        onReady: () => {
          let n = 0
          const t = setInterval(() => {
            const d = player.getDuration?.()
            if (d > 0) {
              clearInterval(t)
              done(d)
            } else if (++n > 20) {
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

export async function probe(url) {
  const out = { dur: null, img: null }
  const yt = url.match(YT_RE)
  if (yt) {
    out.img = `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`
    out.dur = await withTimeout(youtubeDuration(yt[1]))
    return out
  }
  const vm = url.match(VM_RE)
  if (vm) {
    try {
      const r = await fetch('https://vimeo.com/api/oembed.json?url=' + encodeURIComponent('https://vimeo.com/' + vm[1]))
      const j = await r.json()
      out.dur = j.duration || null
      out.img = j.thumbnail_url || null
    } catch {}
    return out
  }
  const dr = url.match(DR_RE)
  if (dr) {
    out.img = `https://drive.google.com/thumbnail?id=${dr[1]}&sz=w640`
    return out
  }
  out.dur = await withTimeout(videoDuration(url))
  out.img = await withTimeout(videoFrame(url))
  return out
}
