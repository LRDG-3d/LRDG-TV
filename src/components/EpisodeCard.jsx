import Icon from './Icon.jsx'

export default function EpisodeCard({ ep, isNew, onOpen, onDelete }) {
  const code = `T${ep.s || 1}E${String(ep.e || 1).padStart(2, '0')}`

  return (
    <div className="ep" onClick={() => ep.u && window.open(ep.u, '_blank', 'noopener')}>
      <div className="th">
        <Icon name="rose" />
        {isNew && <span className="tag">NOVEDAD</span>}
        {ep.d && <span className="dur">{ep.d}</span>}
      </div>
      <div className="info">
        <b>{ep.t}</b>
        <span>{code}</span>
      </div>
      <button
        className="dots"
        aria-label="Eliminar capítulo"
        onClick={(e) => {
          e.stopPropagation()
          if (confirm('¿Eliminar este capítulo?')) onDelete()
        }}
      >
        ⋮
      </button>
    </div>
  )
}
