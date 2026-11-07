import Icon from './Icon.jsx'

export default function Empty({ icon, children }) {
  return (
    <div className="empty">
      <span className="big">
        <Icon name={icon} />
      </span>
      {children}
    </div>
  )
}
