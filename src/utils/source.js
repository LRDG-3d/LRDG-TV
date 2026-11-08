// Decide cómo mostrar el enlace que pegó el admin
export function parseSource(url) {
  if (!url) return { type: 'none' }
  const yt = url.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?rel=0&playsinline=1` }
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return { type: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}` }
  const dr = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/)
  if (dr) return { type: 'iframe', src: `https://drive.google.com/file/d/${dr[1]}/preview` }
  return { type: 'video', src: url }
}
