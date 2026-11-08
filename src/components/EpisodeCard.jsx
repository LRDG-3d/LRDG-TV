import Icon from './Icon.jsx'

export default function EpisodeCard({ ep, index = 0, isNew, canDelete, onDelete }) {
  const code = `T${ep.s || 1}E${String(ep.e || 1).padStart(2, '0')}`

  return (
    <div
      className="ep"
      style={{ '--i': index }}
      onClick={() => { window.location.hash = '#/ver/' + ep.id }}
    >
      <div className="th">
        <Icon name="rose" />
        {isNew && <span className="tag">NOVEDAD</span>}
        {ep.d && <span className="dur">{ep.d}</span>}
      </div>
      <div className="info">
        <b>{ep.t}</b>
        <span>{code}</span>
      </div>
      {canDelete && (
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
      )}
    </div>
  )
}
