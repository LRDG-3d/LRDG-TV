import Icon from './Icon.jsx'

const ACTIONS = [
  { id: 'season', icon: 'film', label: 'Agregar temporada' },
  { id: 'episode', icon: 'play', label: 'Agregar capítulo' },
  { id: 'release', icon: 'cal', label: 'Agregar estreno al calendario' },
]

export default function AdminMenu({ onPick, onClose }) {
  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="box">
        <h3>Administrar</h3>
        {ACTIONS.map((a, i) => (
          <button key={a.id} className="act" style={{ '--i': i }} onClick={() => onPick(a.id)}>
            <Icon name={a.icon} />
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}
