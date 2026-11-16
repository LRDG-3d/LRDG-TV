import Poster from './Poster.jsx'

export default function Card({ produccion, onAbrir }) {
  return (
    <button className="card" onClick={() => onAbrir(produccion.id)}>
      <div className="card__media">
        <Poster produccion={produccion} />
        <span className="card__hover">Ver ficha</span>
      </div>
      <div className="card__info">
        <h3>{produccion.titulo}</h3>
        <p>{produccion.anio} · {produccion.categoria}</p>
      </div>
    </button>
  )
}
