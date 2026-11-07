import { useState } from 'react'
import Empty from './Empty.jsx'
import Icon from './Icon.jsx'

export default function Calendar() {
  const [tab, setTab] = useState('todas')
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const gmt = -now.getTimezoneOffset() / 60

  return (
    <section className="cal">
      <h3>Calendario de estrenos</h3>
      <small>
        GMT{gmt >= 0 ? '+' : ''}
        {gmt} (Tu zona horaria) • Actualizado a las {hh}:{mm}
      </small>
      <div className="tabs">
        <button className={'tab' + (tab === 'hoy' ? ' on' : '')} onClick={() => setTab('hoy')}>
          Hoy <span className="n">0</span>
        </button>
        <button className={'tab' + (tab === 'todas' ? ' on' : '')} onClick={() => setTab('todas')}>
          <Icon name="cal" /> Todas las fechas <span className="n">0</span>
        </button>
        <button className={'tab' + (tab === 'estrenos' ? ' on' : '')} onClick={() => setTab('estrenos')}>
          Estrenos
        </button>
      </div>
      <Empty icon="cal">No hay estrenos programados por ahora.</Empty>
    </section>
  )
}
