import Icon from './Icon.jsx'

export default function ContinueCard({ ep, serie, pct, index = 0 }) {
  const img = ep.img || serie?.banner || serie?.img
  const code = `T${ep.s || 1}E${String(ep.e || 1).padStart(2, '0')}`
  return (
    <button
      className="ccard"
      style={{ '--i': index, '--c': serie?.color || '#3b82f6' }}
      onClick={() => { window.location.hash = '#/ver/' + ep.id }}
    >
      <div className="cover" style={img ? { backgroundImage: `url("${img}")` } : undefined}>
        {!img && <Icon name="rose" />}
        <div className="pbarx"><i style={{ width: pct + '%' }} /></div>
      </div>
      <b>{ep.t}</b>
      <span>{code}{serie ? ` - ${serie.nombre}` : ''}</span>
    </button>
  )
}
