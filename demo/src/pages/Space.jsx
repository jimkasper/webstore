import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useEngineAuth } from '../store/engineAuth.js'

const tierColor = { bronze: 'tier-bronze', silver: 'tier-silver', gold: 'tier-gold', platinum: 'tier-platinum', diamond: 'tier-diamond' }

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function PostCard({ post, isOwner, onDelete }) {
  const [liked, setLiked] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar" style={{ background: 'linear-gradient(135deg, var(--accent), var(--blue))' }}>
          {post.author.name.split(' ').map(w => w[0]).join('')}
        </div>
        <div>
          <div className="post-author">{post.author.name}</div>
          <div className="post-time">@{post.author.handle} · {timeAgo(post.timestamp)}</div>
        </div>
        {isOwner && onDelete && (
          confirmDelete
            ? <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Delete?</span>
                <button className="btn btn-xs" style={{ background: '#e05c5c', color: '#fff', border: 'none', borderRadius: 3, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }} onClick={onDelete}>Yes</button>
                <button className="btn btn-ghost btn-xs" onClick={() => setConfirmDelete(false)}>No</button>
              </div>
            : <button className="btn btn-ghost btn-xs" style={{ marginLeft: 'auto' }} onClick={() => setConfirmDelete(true)}>✕</button>
        )}
      </div>

      {post.achievement && (
        <div className="post-achievement">
          <span style={{ fontSize: 22 }}>🥇</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--amber)' }}>Achievement Unlocked — {post.achievement.tier.charAt(0).toUpperCase() + post.achievement.tier.slice(1)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{post.achievement.name} · 🔥 {post.achievement.streak}-week streak</div>
          </div>
        </div>
      )}

      <div className="post-content">{post.content}</div>

      <div className="post-actions">
        <div className="post-action" onClick={() => setLiked(l => !l)} style={{ color: liked ? 'var(--pink)' : undefined }}>
          {liked ? '❤️' : '🤍'} {post.likes + (liked ? 1 : 0)}
        </div>
        <div className="post-action">💬 {post.comments}</div>
        <div className="post-action">↗ Share</div>
      </div>
    </div>
  )
}

function EditProfileModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({ name: user.name, title: user.title, location: user.location, bio: user.bio })
  function f(key) { return e => setForm(p => ({ ...p, [key]: e.target.value })) }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Edit Profile</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'name', label: 'Display Name' },
            { key: 'title', label: 'Title / Role' },
            { key: 'location', label: 'Location' },
          ].map(fi => (
            <label key={fi.key} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
              {fi.label}
              <input value={form[fi.key]} onChange={f(fi.key)}
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13 }} />
            </label>
          ))}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
            Bio
            <textarea value={form.bio} onChange={f('bio')} rows={3}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13, resize: 'vertical' }} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={() => { onSave(form); onClose() }}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function Space() {
  const nav = useNavigate()
  const { data, addSpacePost, deletePost, updateUser } = useStore()
  const { spacePosts, achievements, user } = data
  const { space: engineSpace } = useEngineAuth()
  const [tab, setTab] = useState('wall')
  const [draft, setDraft] = useState('')
  const [showEditProfile, setShowEditProfile] = useState(false)

  // Use ENGINE profile when authenticated, fall back to demo user
  const displayHandle = engineSpace?.handle || user.handle
  const engineBaseUrl = (import.meta.env.VITE_ENGINE_URL || 'http://localhost:8080')
  const apId = engineSpace ? `${engineBaseUrl}/ap/users/${engineSpace.handle}` : null

  function handlePost() {
    if (!draft.trim()) return
    addSpacePost({ content: draft })
    setDraft('')
  }

  return (
    <div>
      {showEditProfile && (
        <EditProfileModal
          user={user}
          onSave={patch => updateUser(patch)}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {/* Tab override for this page — SpaceShell handles outer nav, we handle content tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {['wall', 'about', 'achievements'].map(t => (
          <div
            key={t}
            className={`monogenes-nav-item ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
        <div
          className="monogenes-nav-item"
          onClick={() => nav('/monogenes/feed')}
        >Feed</div>
      </div>

      {/* Wall */}
      {tab === 'wall' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
          <div>
            {/* Compose box */}
            <div className="compose-box" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div className="post-avatar" style={{ background: 'linear-gradient(135deg, var(--accent), var(--blue))', width: 32, height: 32, fontSize: 12 }}>JM</div>
                <textarea
                  className="compose-area"
                  placeholder="Share an update, achievement, or thought…"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handlePost() }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="btn btn-ghost btn-xs">📷 Photo</button>
                <button className="btn btn-ghost btn-xs">🏆 Achievement</button>
                <button className="btn btn-ghost btn-xs">📍 Place</button>
                <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={handlePost} disabled={!draft.trim()}>Post</button>
              </div>
            </div>

            {spacePosts.length === 0 && (
              <div className="empty">
                <div className="empty-icon">📝</div>
                <div className="empty-title">No posts yet</div>
                <p>Write something above to post to your wall.</p>
              </div>
            )}
            {spacePosts.map(p => (
              <PostCard key={p.id} post={p} isOwner onDelete={() => deletePost(p.id)} />
            ))}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card card-sm" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div className="section-title" style={{ margin: 0 }}>About Jordan</div>
                <button className="btn btn-ghost btn-xs" onClick={() => setShowEditProfile(true)}>Edit</button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 10 }}>{user.bio}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>📍 {user.location}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>💼 {user.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>🔒 Privacy tier: {user.tier}</div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 10 }} onClick={() => setTab('about')}>View full About →</button>
            </div>

            <div className="card card-sm">
              <div className="section-title">Top achievements</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {achievements.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 12 }}>No achievements yet.</div>}
                {achievements.slice(0, 3).map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{a.badge}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{a.streak} streak</div>
                    </div>
                    <span className={`badge ${tierColor[a.tier]}`}>{a.tier}</span>
                  </div>
                ))}
                <button className="btn btn-ghost btn-xs" style={{ marginTop: 4 }} onClick={() => setTab('achievements')}>All achievements →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About */}
      {tab === 'about' && (
        <div style={{ maxWidth: 600 }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="section-title" style={{ margin: 0 }}>Bio</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditProfile(true)}>Edit Profile</button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>{user.bio}</p>
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="section-title">Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '💼', label: 'Work', value: user.title },
                { icon: '📍', label: 'Location', value: user.location },
                { icon: '📅', label: 'Member since', value: 'January 2024' },
                { icon: '🔒', label: 'Privacy tier', value: `${user.tier} — Balanced` },
                { icon: '⬡', label: 'Credits', value: `${user.credits} credits earned` },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16, width: 24 }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', width: 80 }}>{item.label}</span>
                  <span style={{ fontSize: 13 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="section-title">Stats</div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div className="stat-pill"><div className="stat-num">{user.stats.posts}</div><div className="stat-label">Posts</div></div>
              <div className="stat-pill"><div className="stat-num">{user.stats.followers}</div><div className="stat-label">Followers</div></div>
              <div className="stat-pill"><div className="stat-num">{user.stats.following}</div><div className="stat-label">Following</div></div>
              <div className="stat-pill"><div className="stat-num">{user.credits}</div><div className="stat-label">Credits</div></div>
            </div>
          </div>

          {/* ActivityPub identity — shown when ENGINE is connected */}
          {apId && (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="section-title">ActivityPub Identity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16, width: 24 }}>⬡</span>
                  <span style={{ color: 'var(--text-3)', width: 80 }}>AP ID</span>
                  <code style={{ color: 'var(--accent)', fontSize: 11, wordBreak: 'break-all' }}>{apId}</code>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16, width: 24 }}>🔍</span>
                  <span style={{ color: 'var(--text-3)', width: 80 }}>WebFinger</span>
                  <code style={{ color: 'var(--text-2)', fontSize: 11 }}>acct:{displayHandle}@{engineBaseUrl.replace(/^https?:\/\//, '')}</code>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                  Follow from Mastodon or any ActivityPub server using the WebFinger address above.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Achievements */}
      {tab === 'achievements' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
            {achievements.length === 0 && (
              <div className="empty" style={{ gridColumn: '1/-1' }}>
                <div className="empty-icon">🏆</div>
                <div className="empty-title">No achievements yet</div>
                <p>Complete goals to earn badges.</p>
              </div>
            )}
            {achievements.map(a => (
              <div
                key={a.id}
                className="card card-sm"
                style={{ textAlign: 'center', borderColor: a.tier === 'gold' ? 'rgba(251,191,36,.3)' : undefined }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{a.badge}</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.name}</div>
                <div style={{ marginBottom: 8 }}>
                  <span className={`badge ${tierColor[a.tier]}`}>{a.tier}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>🔥 {a.streak} {a.streak === 1 ? 'period' : 'periods'} streak</div>
                <div style={{ fontSize: 12, color: 'var(--amber)', marginTop: 4 }}>+{a.credits} credits</div>
              </div>
            ))}
          </div>
          <div className="card card-sm">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600 }}>Total credits earned</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>From all achievement completions</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 28, fontWeight: 700, color: 'var(--amber)' }}>
                {achievements.reduce((s, a) => s + a.credits, 0)} ⬡
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
