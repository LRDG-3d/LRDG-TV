import Icon from './Icon.jsx'

export default function SerieCard({ serie, index = 0, wide = false }) {
  const img = wide ? serie.banner || serie.img : serie.img
  return (
    <button
      className={'scard' + (wide ? ' wide' : '')}
      style={{ '--i': index, '--c': serie.color || '#3b82f6' }}
      onClick={() => { window.location.hash = '#/serie/' + serie.id }}
    >
      <div className={'cover' + (wide ? ' wide' : '')} style={img ? { backgroundImage: `url("${img}")` } : undefined}>
        {!img && <Icon name="rose" />}
      </div>
      <b>{serie.nombre}</b>
    </button>
  )
}
