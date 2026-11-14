import Icon from './Icon.jsx'

// size: mediano (carátula vertical) | grande | muygrande (imagen horizontal)
export default function SerieCard({ serie, index = 0, size = 'mediano' }) {
  const wide = size === 'grande' || size === 'muygrande'
  const img = wide ? serie.banner || serie.img : serie.img
  return (
    <button
      className={'scard' + (wide ? ' wide' : '') + (size === 'muygrande' ? ' xl' : '') + (size === 'pequeno' ? ' sm' : '')}
      style={{ '--i': index, '--c': serie.color || '#3b82f6' }}
      aria-label={serie.nombre}
      onClick={() => { window.location.hash = '#/serie/' + serie.id }}
    >
      <div className={'cover' + (wide ? ' wide' : '')} style={img ? { backgroundImage: `url("${img}")` } : undefined}>
        {!img && <Icon name="rose" />}
      </div>
      <b>{serie.nombre}</b>
    </button>
  )
}
