import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

const bg = '#060c18'
const surface = '#1e293b'
const border = '1px solid #334155'
const accent = '#84cc16'
const text1 = '#f1f5f9'
const text2 = '#94a3b8'
const text3 = '#64748b'

function relTime(ts) {
  const h = Math.floor((Date.now() - new Date(ts)) / 3600000)
  return h < 1 ? `${Math.floor((Date.now() - new Date(ts)) / 60000)}m ago` : h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`
}

function PostCard({ post, onVote }) {
  return (
    <div style={{ background: surface, border, borderRadius: 8, padding: '14px 16px', marginBottom: 10, display: 'flex', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 32 }}>
        <button onClick={() => onVote(post.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: post.userVote === 1 ? accent : text3, fontSize: 14, lineHeight: 1, padding: '2px 4px' }}>▲</button>
        <span style={{ fontSize: 13, fontWeight: 600, color: post.userVote === 1 ? accent : post.userVote === -1 ? '#f87171' : text1 }}>{post.votes}</span>
        <button onClick={() => onVote(post.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: post.userVote === -1 ? '#f87171' : text3, fontSize: 14, lineHeight: 1, padding: '2px 4px' }}>▼</button>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
          <span style={{ background: '#0f172a', border, borderRadius: 4, padding: '1px 7px', fontSize: 11, color: text2 }}>{post.communityIcon} {post.communityName}</span>
          {post.flair && <span style={{ background: '#1a2744', borderRadius: 4, padding: '1px 7px', fontSize: 11, color: '#7dd3fc' }}>{post.flair}</span>}
        </div>
        <div style={{ fontWeight: 600, fontSize: 15, color: text1, marginBottom: 4, lineHeight: 1.3 }}>{post.title}</div>
        <div style={{ fontSize: 13, color: text2, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {post.content.slice(0, 140)}{post.content.length > 140 ? '…' : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: text3 }}>
          <span>{post.author.name}</span>
          <span>💬 {post.commentCount} comments</span>
          <span>{relTime(post.timestamp)}</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: text3, fontSize: 12, padding: 0 }}>↗ Share</button>
        </div>
      </div>
    </div>
  )
}

export default function Agora() {
  const navigate = useNavigate()
  const { data, voteAgoraPost, joinAgoraCommunity, leaveAgoraCommunity, addAgoraPost } = useStore()
  const communities = data.agoraCommunities || []
  const posts = data.agoraPosts || []
  const user = data.user || {}

  const [sort, setSort] = useState('hot')
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ communityId: '', title: '', content: '', flair: '' })

  const categories = useMemo(() => [...new Set(communities.map(c => c.category))], [communities])

  const activeCommunity = selectedCommunity && !categories.includes(selectedCommunity)
    ? communities.find(c => c.id === selectedCommunity)
    : null

  const filtered = useMemo(() => {
    let list = posts
    if (selectedCommunity) {
      if (categories.includes(selectedCommunity)) {
        const ids = communities.filter(c => c.category === selectedCommunity).map(c => c.id)
        list = list.filter(p => ids.includes(p.communityId))
      } else {
        list = list.filter(p => p.communityId === selectedCommunity)
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q))
    }
    if (sort === 'new') return [...list].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    return [...list].sort((a, b) => b.votes - a.votes)
  }, [posts, selectedCommunity, search, sort, categories, communities])

  const topCommunities = useMemo(() => [...communities].sort((a, b) => b.members - a.members).slice(0, 4), [communities])

  function handlePost() {
    if (!createForm.communityId || !createForm.title.trim()) return
    const c = communities.find(x => x.id === createForm.communityId)
    addAgoraPost({ ...createForm, communityName: c?.name || '', communityIcon: c?.icon || '' })
    setCreateForm({ communityId: '', title: '', content: '', flair: '' })
    setShowCreate(false)
  }

  const setCreate = (k, v) => setCreateForm(p => ({ ...p, [k]: v }))

  const inp = { background: '#0f172a', border, borderRadius: 4, padding: '7px 10px', color: text1, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text1, fontFamily: 'system-ui, sans-serif' }}>

      <div style={{ position: 'sticky', top: 0, zIndex: 100, height: 48, background: bg, borderBottom: border, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: text2, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>← Home</button>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: 1, color: accent, whiteSpace: 'nowrap' }}>⬣ AGORA</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search posts…"
          style={{ ...inp, flex: 1, maxWidth: 400, padding: '5px 10px' }}
        />
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowCreate(true)} style={{ background: accent, border: 'none', borderRadius: 6, padding: '6px 14px', color: '#0a0a0a', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>Create Post</button>
        <span style={{ fontSize: 13, color: text2, whiteSpace: 'nowrap' }}>{user.handle} · <span style={{ color: accent }}>{user.credits}cr</span></span>
      </div>

      <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '16px 12px', gap: 16, alignItems: 'flex-start' }}>

        <div style={{ width: 220, flexShrink: 0, position: 'sticky', top: 64, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: text3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>My Communities</div>
          {communities.filter(c => c.joined).map(c => (
            <button key={c.id} onClick={() => setSelectedCommunity(c.id === selectedCommunity ? null : c.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: selectedCommunity === c.id ? '#1a2744' : 'none', border: 'none', borderRadius: 5, padding: '6px 8px', cursor: 'pointer', color: selectedCommunity === c.id ? text1 : text2, fontSize: 13, textAlign: 'left', marginBottom: 2 }}>
              <span>{c.icon}</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
            </button>
          ))}
          <div style={{ fontSize: 11, fontWeight: 700, color: text3, textTransform: 'uppercase', letterSpacing: 1, margin: '14px 0 8px' }}>Browse</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCommunity(cat === selectedCommunity ? null : cat)}
                style={{ background: selectedCommunity === cat ? accent : '#0f172a', border, borderRadius: 12, padding: '3px 10px', fontSize: 12, color: selectedCommunity === cat ? '#0a0a0a' : text2, cursor: 'pointer', fontWeight: selectedCommunity === cat ? 700 : 400 }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            {['hot', 'new', 'top'].map(s => (
              <button key={s} onClick={() => setSort(s)}
                style={{ background: sort === s ? accent : 'none', border: sort === s ? 'none' : border, borderRadius: 16, padding: '4px 14px', fontSize: 13, color: sort === s ? '#0a0a0a' : text2, cursor: 'pointer', fontWeight: sort === s ? 700 : 400, textTransform: 'capitalize' }}>
                {s === 'hot' ? '🔥 Hot' : s === 'new' ? '✨ New' : '⬆ Top'}
              </button>
            ))}
          </div>

          {activeCommunity && (
            <div style={{ background: surface, border, borderRadius: 8, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{activeCommunity.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{activeCommunity.name}</span>
                  <span style={{ color: text3, fontSize: 13 }}>{activeCommunity.members.toLocaleString()} members</span>
                  <button onClick={() => activeCommunity.joined ? leaveAgoraCommunity(activeCommunity.id) : joinAgoraCommunity(activeCommunity.id)}
                    style={{ background: activeCommunity.joined ? 'none' : accent, border: activeCommunity.joined ? border : 'none', borderRadius: 5, padding: '3px 10px', fontSize: 12, color: activeCommunity.joined ? text2 : '#0a0a0a', cursor: 'pointer', fontWeight: 600 }}>
                    {activeCommunity.joined ? 'Joined ✓' : 'Join'}
                  </button>
                </div>
                <div style={{ fontSize: 13, color: text2 }}>{activeCommunity.description}</div>
              </div>
              <button onClick={() => setSelectedCommunity(null)} style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer', fontSize: 16, padding: '0 4px', lineHeight: 1 }}>×</button>
            </div>
          )}

          {filtered.length === 0
            ? <div style={{ textAlign: 'center', color: text3, padding: '48px 0', fontSize: 14 }}>No posts found</div>
            : filtered.map(post => <PostCard key={post.id} post={post} onVote={voteAgoraPost} />)
          }
        </div>

        <div style={{ width: 180, flexShrink: 0, position: 'sticky', top: 64 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: text3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Communities</div>
          {topCommunities.map(c => (
            <div key={c.id} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                <span style={{ fontSize: 13 }}>{c.icon}</span>
                <span style={{ fontSize: 12, color: text1, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{c.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: text3 }}>{c.members.toLocaleString()}</span>
                <button onClick={() => c.joined ? leaveAgoraCommunity(c.id) : joinAgoraCommunity(c.id)}
                  style={{ background: c.joined ? 'none' : accent, border: c.joined ? border : 'none', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: c.joined ? text2 : '#0a0a0a', cursor: 'pointer', fontWeight: 600 }}>
                  {c.joined ? 'Leave' : 'Join'}
                </button>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 11, fontWeight: 700, color: text3, textTransform: 'uppercase', letterSpacing: 1, margin: '14px 0 8px' }}>Categories</div>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCommunity(cat === selectedCommunity ? null : cat)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '3px 0', fontSize: 12, color: selectedCommunity === cat ? accent : text2, cursor: 'pointer' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {showCreate && (
        <div onClick={e => e.target === e.currentTarget && setShowCreate(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: surface, border, borderRadius: 10, padding: 24, width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Create Post</span>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <select value={createForm.communityId} onChange={e => setCreate('communityId', e.target.value)} style={inp}>
              <option value="">Select community…</option>
              {communities.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <input value={createForm.title} onChange={e => setCreate('title', e.target.value)} placeholder="Title" style={inp} />
            <textarea value={createForm.content} onChange={e => setCreate('content', e.target.value)} placeholder="What's on your mind?" rows={4}
              style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
            <input value={createForm.flair} onChange={e => setCreate('flair', e.target.value)} placeholder="Flair (optional)" style={inp} />
            <button onClick={handlePost} disabled={!createForm.communityId || !createForm.title.trim()}
              style={{ background: accent, border: 'none', borderRadius: 6, padding: '9px 0', fontWeight: 700, fontSize: 14, color: '#0a0a0a', cursor: 'pointer', opacity: (!createForm.communityId || !createForm.title.trim()) ? 0.5 : 1 }}>
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
