import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const AVATAR_COLORS = {
  maya: 'linear-gradient(135deg, #f472b6, #a78bfa)',
  priya: 'linear-gradient(135deg, #4ade80, #60a5fa)',
  marcus: 'linear-gradient(135deg, #fbbf24, #f87171)',
  jordan: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
}

function FeedPost({ post, isOwn }) {
  const [liked, setLiked] = useState(false)
  const initials = post.author.name.split(' ').map(w => w[0]).join('')
  return (
    <div className="post-card">
      <div className="post-header">
        <div
          className="post-avatar"
          style={{ background: AVATAR_COLORS[post.author.handle] || 'var(--surface-2)' }}
        >
          {initials}
        </div>
        <div>
          <div className="post-author">{post.author.name}</div>
          <div className="post-time">@{post.author.handle} · {timeAgo(post.timestamp)}</div>
        </div>
        {isOwn && <span className="badge badge-accent" style={{ marginLeft: 'auto', fontSize: 10 }}>You</span>}
      </div>
      {post.achievement && (
        <div className="post-achievement">
          <span style={{ fontSize: 20 }}>🥇</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--amber)' }}>Achievement · {post.achievement.tier}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{post.achievement.name} — {post.achievement.streak}-week streak</div>
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

export default function SpaceFeed() {
  const nav = useNavigate()
  const { data, addSpacePost } = useStore()
  const { feedPosts, spacePosts, user } = data

  const [filter, setFilter] = useState('following')
  const [draft, setDraft] = useState('')

  const allPosts = [
    ...spacePosts.map(p => ({ ...p, isOwn: true })),
    ...feedPosts.map(p => ({ ...p, isOwn: false })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  function handlePost() {
    if (!draft.trim()) return
    addSpacePost({ content: draft })
    setDraft('')
  }

  return (
    <div>
      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <div className="monogenes-nav-item" onClick={() => nav('/monogenes')}>Wall</div>
        <div className="monogenes-nav-item active">Feed</div>
        <div className="monogenes-nav-item" onClick={() => nav('/monogenes')}>About</div>
        <div className="monogenes-nav-item" onClick={() => nav('/monogenes')}>Achievements</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        {/* Feed */}
        <div>
          {/* Compose */}
          <div className="compose-box">
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div className="post-avatar" style={{ background: AVATAR_COLORS.jordan, flexShrink: 0, width: 34, height: 34, fontSize: 12 }}>JM</div>
              <textarea
                className="compose-area"
                placeholder="What's on your mind, Jordan?"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handlePost() }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn btn-ghost btn-xs">📷 Photo</button>
              <button className="btn btn-ghost btn-xs">🎵 Music</button>
              <button className="btn btn-ghost btn-xs">📍 Place</button>
              <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={handlePost} disabled={!draft.trim()}>
                Post
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {['following', 'mutuals', 'all'].map(f => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {allPosts.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📡</div>
              <div className="empty-title">No posts yet</div>
              <p>Seed data will populate this feed.</p>
            </div>
          ) : (
            allPosts.map(p => <FeedPost key={p.id} post={p} isOwn={p.isOwn} />)
          )}
        </div>

        {/* Right sidebar */}
        <div>
          <div className="card card-sm" style={{ marginBottom: 16 }}>
            <div className="section-title">Who to follow</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { handle: 'kai', name: 'Kai Patel', desc: 'Fitness · Music', avatar: 'linear-gradient(135deg,#4ade80,#60a5fa)' },
                { handle: 'lisa', name: 'Lisa Monroe', desc: 'Design · Coffee', avatar: 'linear-gradient(135deg,#f472b6,#fbbf24)' },
                { handle: 'alex', name: 'Alex Chen', desc: 'Tech · Running', avatar: 'linear-gradient(135deg,#818cf8,#4ade80)' },
              ].map(u => (
                <div key={u.handle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="post-avatar" style={{ background: u.avatar, width: 32, height: 32, fontSize: 11, flexShrink: 0 }}>
                    {u.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 12 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.desc}</div>
                  </div>
                  <button className="btn btn-ghost btn-xs">Follow</button>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-sm" style={{ marginBottom: 16 }}>
            <div className="section-title">Trending</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['#GymStreak', '#5KTraining', '#ReadingChallenge', '#SeattleRunners', '#nTogether'].map((tag, i) => (
                <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-3)', width: 16 }}>{i + 1}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-sm">
            <div className="section-title">Feed settings</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>Algorithm</div>
            <select className="input" style={{ fontSize: 12, marginBottom: 10 }}>
              <option>Chronological</option>
              <option>Engagement-ranked</option>
              <option>Connections first</option>
            </select>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Show reposts', 'Show replies'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
