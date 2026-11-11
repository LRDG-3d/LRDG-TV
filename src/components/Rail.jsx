export default function Rail({ title, children }) {
  return (
    <section className="rail">
      <h3 className="rt">{title}</h3>
      <div className="hrow">{children}</div>
    </section>
  )
}
