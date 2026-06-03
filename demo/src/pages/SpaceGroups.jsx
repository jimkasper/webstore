import { useState } from 'react'
import { useStore } from '../store.jsx'

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
}


const CATEGORIES = ['All', 'Fitness', 'Tech', 'Books', 'Health']
const GROUP_CATEGORIES = ['Fitness', 'Reading', 'Tech', 'Wellness', 'Lifestyle', 'Other']
const EMPTY_GROUP_FORM = { name: '', category: 'Fitness', description: '', privacy: 'public', emoji: '🌐' }

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function PostCard({ post, onDelete }) {
  const [liked, setLiked] = useState(false)
  const bg = AVATAR_COLORS[post.author.handle] || 'var(--surface-2)'
  const ini = post.author.name.split(' ').map(w => w[0]).join('')
  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar" style={{ background: bg }}>{ini}</div>
        <div>
          <div className="post-author">{post.author.name}</div>
          <div className="post-time">@{post.author.handle} · {timeAgo(post.timestamp)}</div>
        </div>
        {onDelete && (
          <button onClick={onDelete} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, padding: '2px 4px' }} title="Delete post">✕</button>
        )}
      </div>
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

function GroupCard({ group, onClick }) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 28, flexShrink: 0 }}>{group.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{group.name}</span>
            {group.joined && <span className="badge badge-accent" style={{ fontSize: 10 }}>Joined</span>}
          </div>
          <span className="badge badge-surface" style={{ fontSize: 10, marginTop: 2 }}>{group.category}</span>
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 12,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {group.description}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
        {group.members.toLocaleString()} members · {Array.isArray(group.posts) ? group.posts.length : (group.posts || 0)} posts · {group.privacy}
      </div>
    </div>
  )
}

export default function SpaceGroups() {
  const { data, joinGroup, leaveGroup, addGroupPost, deleteGroupPost, addSpaceGroup } = useStore()
  const [selected, setSelected] = useState(null)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [groupDraft, setGroupDraft] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_GROUP_FORM)

  const spaceGroups = data.spaceGroups || []
  const group = spaceGroups.find(g => g.id === selected)

  const filtered = spaceGroups
    .filter(g => category === 'All' || g.category === category)
    .filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase()))

  if (selected && group) {
    const posts = group.posts || []
    const members = (data.connections || []).slice(0, 5)

    return (
      <div>
        {/* Group header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>← Back</button>
          <div style={{ fontSize: 28 }}>{group.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{group.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              <span className="badge badge-surface" style={{ fontSize: 10, marginRight: 8 }}>{group.category}</span>
              {group.members.toLocaleString()} members · {Array.isArray(group.posts) ? group.posts.length : (group.posts || 0)} posts
            </div>
          </div>
          <button
            className={`btn btn-sm ${group.joined ? 'btn-ghost' : 'btn-primary'}`}
            onClick={() => group.joined ? leaveGroup(group.id) : joinGroup(group.id)}
          >
            {group.joined ? 'Leave Group' : 'Join Group'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24 }}>
          {/* Feed */}
          <div>
            <div className="card card-sm" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{group.description}</div>
            </div>

            {group.joined && (
              <div className="card card-sm" style={{ marginBottom: 16 }}>
                <textarea
                  className="input"
                  rows={3}
                  placeholder={`Write something in ${group.name}…`}
                  value={groupDraft}
                  onChange={e => setGroupDraft(e.target.value)}
                  style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box', marginBottom: 8 }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={!groupDraft.trim()}
                    onClick={() => { addGroupPost(group.id, { content: groupDraft }); setGroupDraft('') }}
                  >
                    Post to group
                  </button>
                </div>
              </div>
            )}

            {posts.length === 0 && (
              <div className="empty">
                <div className="empty-icon">📝</div>
                <div className="empty-title">No posts yet</div>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{group.joined ? 'Be the first to post above.' : 'Join this group to post.'}</p>
              </div>
            )}
            {posts.map(p => (
              <PostCard key={p.id} post={p}
                onDelete={p.author.handle === data.user.handle ? () => deleteGroupPost(group.id, p.id) : undefined}
              />
            ))}
          </div>

          {/* Members sidebar */}
          <div>
            <div className="card card-sm">
              <div className="section-title">Members ({group.members.toLocaleString()})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {members.map(m => {
                  const bg = AVATAR_COLORS[m.handle] || 'var(--surface-2)'
                  const ini = m.name.split(' ').map(w => w[0]).join('')
                  return (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {ini}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
                      </div>
                    </div>
                  )
                })}
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                  + {Math.max(0, group.members - members.length).toLocaleString()} more members
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Joined groups */}
      {spaceGroups.some(g => g.joined) && (
        <div style={{ marginBottom: 32 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>Your groups</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {spaceGroups.filter(g => g.joined).map(g => (
              <GroupCard key={g.id} group={g} onClick={() => setSelected(g.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Discover */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          className="input"
          placeholder="Search groups…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 240 }}
        />
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreate(s => !s)}
          style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 12px', fontSize: 13, cursor: 'pointer' }}>
          {showCreate ? '✕ Cancel' : '+ Create Group'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={e => {
          e.preventDefault()
          addSpaceGroup(createForm)
          setCreateForm(EMPTY_GROUP_FORM)
          setShowCreate(false)
        }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Create a Group</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: 'var(--text-2)', gridColumn: '1/-1' }}>
              Name *
              <input required value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Seattle Cyclists"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13 }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: 'var(--text-2)' }}>
              Category
              <select value={createForm.category} onChange={e => setCreateForm(p => ({ ...p, category: e.target.value }))}
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 8px', color: 'var(--text-1)', fontSize: 13 }}>
                {GROUP_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: 'var(--text-2)' }}>
              Privacy
              <select value={createForm.privacy} onChange={e => setCreateForm(p => ({ ...p, privacy: e.target.value }))}
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 8px', color: 'var(--text-1)', fontSize: 13 }}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: 'var(--text-2)', gridColumn: '1/-1' }}>
              Description
              <textarea value={createForm.description} onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="What's this group about?"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13, resize: 'vertical' }} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontSize: 13, cursor: 'pointer' }}>Create Group</button>
            <button type="button" onClick={() => setShowCreate(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="section-title" style={{ marginBottom: 12 }}>Discover groups</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {filtered.map(g => (
          <GroupCard key={g.id} group={g} onClick={() => setSelected(g.id)} />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-3)', padding: '32px 0', fontSize: 13 }}>
            No groups match your search.
          </div>
        )}
      </div>
    </div>
  )
}
