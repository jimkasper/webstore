import { useState, useEffect } from 'react'
import { useStore } from '../store.jsx'
import { useEngineAuth } from '../store/engineAuth.js'
import { engineConnections } from '../api/engine.js'

const AVATAR_COLORS = {
  maya: 'linear-gradient(135deg,#f472b6,#a78bfa)',
  priya: 'linear-gradient(135deg,#4ade80,#60a5fa)',
  marcus: 'linear-gradient(135deg,#fbbf24,#f87171)',
  jordan: 'linear-gradient(135deg,#a78bfa,#60a5fa)',
  kai: 'linear-gradient(135deg,#4ade80,#22d3ee)',
  lisa: 'linear-gradient(135deg,#f472b6,#fbbf24)',
  alex: 'linear-gradient(135deg,#818cf8,#4ade80)',
  sam: 'linear-gradient(135deg,#60a5fa,#f472b6)',
  james: 'linear-gradient(135deg,#fbbf24,#4ade80)',
  nina: 'linear-gradient(135deg,#34d399,#60a5fa)',
  dex: 'linear-gradient(135deg,#fb923c,#818cf8)',
}

const STATUS_LABELS = { mutual: 'Mutual', following: 'Following', follower: 'Follower', suggested: 'Suggested' }
const FILTERS = ['all', 'mutual', 'following', 'follower', 'suggested']

function PersonCard({ c, onFollow, inContacts }) {
  const bg = AVATAR_COLORS[c.handle] || 'linear-gradient(135deg,#a78bfa,#60a5fa)'
  const ini = c.name.split(' ').map(w => w[0]).join('')
  const isFollowing = c.status === 'following' || c.status === 'mutual'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
        {ini}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>@{c.handle}</span>
          {c.status === 'mutual' && <span className="badge badge-accent" style={{ fontSize: 10 }}>Mutual</span>}
          {inContacts && <span style={{ fontSize: 10, background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: 8, padding: '2px 8px' }}>In Contacts</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>{c.title}</div>
        {c.mutuals > 0 && (
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{c.mutuals} mutual connection{c.mutuals !== 1 ? 's' : ''}</div>
        )}
      </div>
      <button
        className={`btn btn-sm ${isFollowing ? 'btn-ghost' : 'btn-primary'}`}
        onClick={() => onFollow(c.handle)}
      >
        {isFollowing ? 'Unfollow' : c.status === 'follower' ? 'Follow back' : 'Follow'}
      </button>
    </div>
  )
}

export default function SpaceConnections() {
  const { data, followUser, addContactFromConnection } = useStore()
  const { accessToken } = useEngineAuth()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [justFollowed, setJustFollowed] = useState(null)
  const [engineFollowing, setEngineFollowing] = useState(null) // null = not loaded

  // Fetch real ENGINE connections on mount when authenticated
  useEffect(() => {
    if (!accessToken) return
    engineConnections.following().then(list => {
      setEngineFollowing(list || [])
    }).catch(() => {})
  }, [accessToken])

  const connections = data.connections || []

  async function handleFollow(handle) {
    const conn = connections.find(c => c.handle === handle)
    const wasFollowing = conn?.status === 'following' || conn?.status === 'mutual'

    // Optimistic local update first
    followUser(handle)

    // Mirror to ENGINE if authenticated
    if (accessToken) {
      try {
        if (wasFollowing) {
          await engineConnections.unfollow(handle)
        } else {
          await engineConnections.follow(handle)
        }
      } catch {
        // Silent — local state already updated; ENGINE may not have this user
      }
    }

    if (!wasFollowing) setJustFollowed(handle)
  }

  const counts = {
    all: connections.length,
    mutual: connections.filter(c => c.status === 'mutual').length,
    following: connections.filter(c => c.status === 'following').length,
    follower: connections.filter(c => c.status === 'follower').length,
    suggested: connections.filter(c => c.status === 'suggested').length,
  }

  const filtered = connections
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => {
      const q = search.toLowerCase()
      return !q || c.name.toLowerCase().includes(q) || c.handle.includes(q) || c.title.toLowerCase().includes(q)
    })

  return (
    <div>
      {/* ENGINE live counts shown when authenticated */}
      {engineFollowing !== null && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--accent)', background: 'var(--accent-bg)', borderRadius: 12, padding: '3px 10px', marginBottom: 16 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          ENGINE · {engineFollowing.length} following live
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
        {[
          { label: 'Mutual',    value: counts.mutual },
          { label: 'Following', value: engineFollowing ? engineFollowing.length : counts.following + counts.mutual },
          { label: 'Followers', value: counts.follower + counts.mutual },
        ].map(s => (
          <div key={s.label} className="stat-pill">
            <div className="stat-num">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        className="input"
        placeholder="Search connections…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 320 }}
      />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : STATUS_LABELS[f]} ({counts[f]})
          </button>
        ))}
      </div>

      {/* List */}
      <div>
        {filtered.length === 0 && (
          <div className="empty">
            <div className="empty-icon">🤝</div>
            <div className="empty-title">No connections here</div>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Try a different filter or search.</p>
          </div>
        )}
        {filtered.map(c => (
          <PersonCard key={c.id} c={c} onFollow={handleFollow} inContacts={(data.contacts || []).some(ct => ct.handle === c.handle)} />
        ))}
      </div>

      {filter === 'all' && !search && (
        <div style={{ marginTop: 32 }}>
          <div className="section-title">Suggested people to follow</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>
            Based on your connections and interests
          </div>
          {connections.filter(c => c.status === 'suggested').map(c => (
            <PersonCard key={c.id} c={c} onFollow={handleFollow} inContacts={(data.contacts || []).some(ct => ct.handle === c.handle)} />
          ))}
        </div>
      )}

      {justFollowed && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', boxShadow: '0 4px 16px rgba(0,0,0,.35)', display: 'flex', gap: 10, alignItems: 'center', zIndex: 300 }}>
          <span style={{ fontSize: 13 }}>Add @{justFollowed} to Contacts?</span>
          <button onClick={() => { addContactFromConnection(justFollowed); setJustFollowed(null) }}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>Add</button>
          <button onClick={() => setJustFollowed(null)}
            style={{ background: 'none', border: 'none', fontSize: 16, color: 'var(--text-3)', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
      )}
    </div>
  )
}
