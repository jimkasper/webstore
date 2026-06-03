import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useStore, getActiveDemo } from '../store.jsx'
import EngineAuthGate from './EngineAuthGate.jsx'

const THEMES = {
  default:  { '--accent': '#84cc16', '--space-bg': '#0f172a', '--space-surface': '#1e293b', '--space-border': '#334155' },
  midnight: { '--accent': '#6366f1', '--space-bg': '#0f0f1a', '--space-surface': '#1a1a2e', '--space-border': '#2d2d4a' },
  sage:     { '--accent': '#4ade80', '--space-bg': '#0d1f14', '--space-surface': '#122016', '--space-border': '#1e4026' },
  sunset:   { '--accent': '#fb923c', '--space-bg': '#1a0f0a', '--space-surface': '#2a1a12', '--space-border': '#3a2218' },
  stone:    { '--accent': '#e5e7eb', '--space-bg': '#111111', '--space-surface': '#1c1c1c', '--space-border': '#2a2a2a' },
  neon:     { '--accent': '#f472b6', '--space-bg': '#0a0a1a', '--space-surface': '#111128', '--space-border': '#1e1e3a' },
}

const SOCIAL_TABS = [
  { label: 'Profile',           path: '/monogenes' },
  { label: 'Feed',              path: '/monogenes/feed' },
  { label: 'Connections',       path: '/monogenes/connections' },
  { label: 'Messages',          path: '/monogenes/messages',       badgeKey: 'messages' },
  { label: 'Notifications',     path: '/monogenes/notifications',  badgeKey: 'notifications' },
  { label: 'Groups',            path: '/monogenes/groups' },
  { label: '✦ CREATEBARBELO',   path: '/barbelo/create',           isBuilder: true },
  { label: '✦ BUILDMONOGENES',  path: '/monogenes/editor',         isBuilder: true },
]

function initials(name) {
  return name.split(' ').map(w => w[0]).join('')
}

export default function SpaceShell() {
  const nav = useNavigate()
  const loc = useLocation()
  const { data } = useStore()
  const u = data.user

  const unreadMessages = (data.conversations || []).reduce((s, cv) => s + (cv.unread || 0), 0)
  const unreadNotifications = (data.notifications || []).filter(n => !n.read).length

  const themeVars = THEMES[u.spaceTheme] || THEMES.default
  const isWebsite = (u.siteType || 'social') === 'website'

  const spaceTabs = isWebsite
    ? [
        ...((data.spacePages || []).map(pg => ({
          label: pg.label,
          path: `/monogenes/${pg.slug === 'wall' ? '' : pg.slug}`.replace(/\/$/, '') || '/monogenes',
        }))),
        { label: '⚙ BUILDMONOGENES', path: '/monogenes/editor', isBuilder: true },
      ]
    : SOCIAL_TABS

  return (
    <EngineAuthGate>
    <div className="monogenes-shell" style={themeVars}>
      {/* Back to LIFE + Demo switcher */}
      <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 30, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => nav('/autogenes')}>← AUTOGENES</button>
        <button className="btn btn-ghost btn-sm"
          onClick={() => { const o = getActiveDemo() === 'jordan' ? 'jim' : 'jordan'; localStorage.setItem('barbelo-active-demo', o); window.location.reload() }}
          title="Switch demo">
          {getActiveDemo() === 'jordan' ? '🎭 Jordan' : '🧪 Jim'} ⇄
        </button>
      </div>

      {/* Cover */}
      <div className="monogenes-cover">
        <div className="monogenes-cover-actions">
          {!isWebsite && <button className="btn btn-ghost btn-sm" onClick={() => nav('/monogenes/feed')}>📡 Feed</button>}
        </div>
      </div>

      {/* Profile row — social mode only shows follower stats */}
      <div className="monogenes-profile-row">
        <div className="monogenes-avatar">{initials(u.name)}</div>
        <div className="monogenes-identity">
          <div className="monogenes-name">{u.name}</div>
          <div className="monogenes-handle">@{u.handle} · {u.location}</div>
        </div>
        <div className="monogenes-actions">
          {!isWebsite && (
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginRight: 12 }}>
              {[
                { label: 'Followers', value: u.stats.followers },
                { label: 'Following', value: u.stats.following },
                { label: 'Posts',     value: u.stats.posts },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
          {isWebsite && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginRight: 12 }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--space-surface)', border: '1px solid var(--space-border)', borderRadius: 6, padding: '3px 10px' }}>
                🌐 Website
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="monogenes-body">
        {/* Nav */}
        <div className="monogenes-nav">
          {spaceTabs.map(t => {
            const badge = t.badgeKey === 'messages' ? unreadMessages
              : t.badgeKey === 'notifications' ? unreadNotifications : 0
            const isActive = loc.pathname === t.path || (t.label === 'Profile' && loc.pathname === '/monogenes')
            if (t.isBuilder) {
              return (
                <div
                  key={t.label}
                  className="monogenes-nav-item"
                  onClick={() => nav(t.path)}
                  style={{
                    marginLeft: 'auto',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: '.02em',
                    border: '1px solid var(--accent)',
                    borderRadius: 6,
                    padding: '3px 10px',
                    opacity: 0.85,
                  }}
                >
                  {t.label}
                </div>
              )
            }
            return (
              <div
                key={t.label}
                className={`monogenes-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => nav(t.path)}
                style={{ position: 'relative' }}
              >
                {t.label}
                {badge > 0 && (
                  <span style={{
                    position: 'absolute', top: 6, right: 2,
                    background: '#ef4444', color: '#fff',
                    fontSize: 9, fontWeight: 700, padding: '1px 4px',
                    borderRadius: 8, lineHeight: 1.2,
                  }}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <Outlet />
      </div>
    </div>
    </EngineAuthGate>
  )
}
