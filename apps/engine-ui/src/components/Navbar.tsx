import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { authApi } from '../api/auth'

export function Navbar() {
  const { space, refreshToken, clear } = useAuth()
  const nav = useNavigate()

  async function handleLogout() {
    if (refreshToken) await authApi.logout(refreshToken).catch(() => {})
    clear()
    nav('/login')
  }

  return (
    <nav style={{ background: '#1e293b', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 24, borderBottom: '1px solid #334155' }}>
      <Link to="/" style={{ color: '#84cc16', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>
        ⚡ ENGINE
      </Link>
      {space && (
        <>
          <Link to="/" style={navLink}>Dashboard</Link>
          <Link to="/profile" style={navLink}>Profile</Link>
          <Link to="/connections" style={navLink}>Connections</Link>
          <Link to="/transfers" style={navLink}>Transfers</Link>
          <Link to="/federation" style={navLink}>Federation</Link>
          <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: 13 }}>@{space.handle}</span>
          <button onClick={handleLogout} style={btnStyle}>Logout</button>
        </>
      )}
    </nav>
  )
}

const navLink: React.CSSProperties = { color: '#cbd5e1', textDecoration: 'none', fontSize: 14 }
const btnStyle: React.CSSProperties = {
  background: 'transparent', border: '1px solid #475569', color: '#94a3b8',
  padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
}
