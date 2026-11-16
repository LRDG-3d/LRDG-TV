import { categorias } from '../data/catalogo.js'

export default function Header({ categoria, onCategoria, onInicio }) {
  return (
    <header className="header">
      <div className="header__inner">
        <a className="logo" href="#/" onClick={onInicio} aria-label="DLIM TV, inicio">
          <span className="logo__play" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" /></svg>
          </span>
          <span className="logo__text">
            <b>DLIM</b> <i>TV</i>
          </span>
        </a>

        <nav className="nav" aria-label="Categorías">
          <button className={!categoria ? 'is-active' : ''} onClick={() => onCategoria('')}>Todo</button>
          {categorias.map((c) => (
            <button key={c} className={categoria === c ? 'is-active' : ''} onClick={() => onCategoria(c)}>
              {c}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
