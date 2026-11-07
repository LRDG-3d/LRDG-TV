export default function Modal({ title, onClose, onSubmit, children }) {
  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="box"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit?.()
        }}
      >
        <h3>{title}</h3>
        {children}
      </form>
    </div>
  )
}

export function Actions({ onClose, label = 'Guardar', busy = false }) {
  return (
    <div className="row">
      <button type="button" className="btn g" onClick={onClose}>Cancelar</button>
      <button className="btn" disabled={busy}>{label}</button>
    </div>
  )
}
