import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useStore, getActiveDemo } from '../store.jsx'
import DemoSwitcher from './DemoSwitcher.jsx'

const navItems = [
  { icon: '⊞', label: 'Home',     path: '/dash' },
  { icon: '🏃', label: 'Body',     path: '/autogenes/body' },
  { icon: '🧩', label: 'Mind',     path: '/autogenes/mind' },
  { icon: '💼', label: 'Life',     path: '/autogenes/money' },
  { icon: '🌍', label: 'World',    path: '/autogenes/world' },
  { icon: '🤖', label: 'Brain',    path: '/autogenes/brain' },
  { icon: '⬣',  label: 'Platform', path: '/platform' },
]

export default function Shell() {
  const nav = useNavigate()
  const loc = useLocation()
  const { data } = useStore()

  return (
    <div className="app-shell">
      {/* Rail */}
      <div className="rail">
        <div className="rail-logo" onClick={() => nav('/dash')} style={{ cursor: 'pointer' }} title="Home">n</div>
        {navItems.map(item => (
          <div
            key={item.path}
            className={`rail-icon ${(loc.pathname === item.path || (item.path !== '/dash' && loc.pathname.startsWith(item.path.replace('/autogenes', '/autogenes')))) ? 'active' : ''}`}
            onClick={() => nav(item.path)}
          >
            {item.icon}
            <span className="rail-tooltip">{item.label}</span>
          </div>
        ))}
        <div className="rail-spacer" />
        <div
          className="rail-icon"
          onClick={() => nav('/monogenes')}
          title="My Monogenes"
        >
          <span style={{ fontSize: 13, fontWeight: 700 }}>JM</span>
          <span className="rail-tooltip">My Monogenes</span>
        </div>
        <div className="rail-icon" title="Credits">
          <span style={{ fontSize: 11, fontWeight: 700 }}>⬡</span>
          <span className="rail-tooltip">{data.user.credits} credits</span>
        </div>
        <div className="rail-icon" onClick={() => { const o = getActiveDemo() === 'jordan' ? 'jim' : 'jordan'; localStorage.setItem('barbelo-active-demo', o); window.location.reload() }} title="Switch demo">
          <span style={{ fontSize: 13 }}>{getActiveDemo() === 'jordan' ? '🎭' : '🧪'}</span>
          <span className="rail-tooltip">Switch to {getActiveDemo() === 'jordan' ? 'Jim' : 'Jordan'}</span>
        </div>
      </div>

      {/* Main */}
      <div className="main">
        <Outlet />
      </div>
    </div>
  )
}
