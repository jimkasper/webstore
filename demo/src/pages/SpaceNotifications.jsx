import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useEngineSSE } from '../hooks/useEngineSSE.js'

const AVATAR_COLORS = {
  maya: 'linear-gradient(135deg,#f472b6,#a78bfa)',
  priya: 'linear-gradient(135deg,#4ade80,#60a5fa)',
  marcus: 'linear-gradient(135deg,#fbbf24,#f87171)',
  jordan: 'linear-gradient(135deg,#a78bfa,#60a5fa)',
  kai: 'linear-gradient(135deg,#4ade80,#22d3ee)',
  lisa: 'linear-gradient(135deg,#f472b6,#fbbf24)',
  alex: 'linear-gradient(135deg,#818cf8,#4ade80)',
  sam: 'linear-gradient(135deg,#60a5fa,#f472b6)',
}

const TYPE_ICON = { like: '❤️', follow: '👤', comment: '💬', achievement: '🏆', mention: '@️' }
const TYPE_LABEL = { like: 'Likes', follow: 'Follows', comment: 'Comments', achievement: 'Achievements', mention: 'Mentions' }
const FILTER_TYPES = ['like', 'follow', 'comment', 'achievement']

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${Math.max(1, m)}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function groupByDate(notifications) {
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const groups = []
  const buckets = { Today: [], Yesterday: [], Earlier: [] }
  for (const n of notifications) {
    const d = n.timestamp.slice(0, 10)
    if (d >= today) buckets.Today.push(n)
    else if (d >= yesterday) buckets.Yesterday.push(n)
    else buckets.Earlier.push(n)
  }
  for (const [label, items] of Object.entries(buckets)) {
    if (items.length > 0) groups.push({ label, items })
  }
  return groups
}

export default function SpaceNotifications() {
  const nav = useNavigate()
  const { data, markNotificationRead } = useStore()
  const [filter, setFilter] = useState('all')
  const [liveNotifications, setLiveNotifications] = useState([])

  // Subscribe to ENGINE SSE for real-time follow notifications
  const handleEngineMessage = useCallback((msg) => {
    if (!msg || !msg.type) return
    const n = {
      id: `live-${Date.now()}`,
      type: msg.type === 'follow' ? 'follow' : 'like',
      actor: { handle: msg.actor_handle || 'unknown', name: msg.actor_name || msg.actor_handle || 'Someone' },
      content: msg.message || `${msg.type} event`,
      timestamp: new Date().toISOString(),
      read: false,
      link: '/monogenes/connections',
    }
    setLiveNotifications(prev => [n, ...prev])
  }, [])

  useEngineSSE(handleEngineMessage)

  // Merge live ENGINE notifications at the top of the stored ones
  const notifications = [...liveNotifications, ...(data.notifications || [])]
  const unreadCount = notifications.filter(n => !n.read).length

  const filtered = filter === 'all' ? notifications
    : notifications.filter(n => n.type === filter)

  const groups = groupByDate(filtered)

  function handleClick(n) {
    if (n.id.startsWith('live-')) {
      setLiveNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
    } else {
      markNotificationRead(n.id)
    }
    nav(n.link)
  }

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Notifications</div>
          {unreadCount > 0 && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{unreadCount} unread</div>}
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => markNotificationRead('all')}
          disabled={unreadCount === 0}
        >
          Mark all read
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('all')}>
          All ({notifications.length})
        </button>
        {FILTER_TYPES.map(t => (
          <button
            key={t}
            className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(t)}
          >
            {TYPE_ICON[t]} {TYPE_LABEL[t]} ({notifications.filter(n => n.type === t).length})
          </button>
        ))}
      </div>

      {/* Grouped list */}
      {groups.length === 0 && (
        <div className="empty">
          <div className="empty-icon">🔔</div>
          <div className="empty-title">No notifications</div>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>You're all caught up.</p>
        </div>
      )}

      {groups.map(group => (
        <div key={group.label} style={{ marginBottom: 28 }}>
          <div className="section-title" style={{ marginBottom: 8 }}>{group.label}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {group.items.map(n => {
              const bg = AVATAR_COLORS[n.actor?.handle] || 'var(--surface-2)'
              const ini = (n.actor?.name || 'U').split(' ').map(w => w[0]).join('')
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    background: n.read ? 'transparent' : 'rgba(167,139,250,.06)',
                    borderLeft: `3px solid ${n.read ? 'transparent' : 'var(--accent)'}`,
                    borderRadius: 6, cursor: 'pointer',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(167,139,250,.06)'}
                >
                  {/* Type icon */}
                  <div style={{ width: 22, textAlign: 'center', fontSize: 14, flexShrink: 0 }}>
                    {TYPE_ICON[n.type] || '🔔'}
                  </div>

                  {/* Actor avatar */}
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {ini}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 600 }}>{n.actor?.name}</span>
                      {' '}
                      <span style={{ color: 'var(--text-2)' }}>{n.content}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{timeAgo(n.timestamp)}</div>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
