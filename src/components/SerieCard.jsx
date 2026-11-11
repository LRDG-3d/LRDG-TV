import Icon from './Icon.jsx'

export default function SerieCard({ serie, index = 0 }) {
  return (
    <button
      className="scard"
      style={{ '--i': index, '--c': serie.color || '#3b82f6' }}
      onClick={() => { window.location.hash = '#/serie/' + serie.id }}
    >
      <div className="cover" style={serie.img ? { backgroundImage: `url("${serie.img}")` } : undefined}>
        {!serie.img && <Icon name="rose" />}
      </div>
      <b>{serie.nombre}</b>
    </button>
  )
}
