import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store.jsx'

const AVATAR_COLORS = {
  maya: 'linear-gradient(135deg,#f472b6,#a78bfa)',
  priya: 'linear-gradient(135deg,#4ade80,#60a5fa)',
  marcus: 'linear-gradient(135deg,#fbbf24,#f87171)',
  jordan: 'linear-gradient(135deg,#a78bfa,#60a5fa)',
  kai: 'linear-gradient(135deg,#4ade80,#22d3ee)',
  lisa: 'linear-gradient(135deg,#f472b6,#fbbf24)',
  alex: 'linear-gradient(135deg,#818cf8,#4ade80)',
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function SpaceMessages() {
  const { data, sendMessage, markConversationRead, addConversation } = useStore()
  const [activeId, setActiveId] = useState(null)
  const [draft, setDraft] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newSearch, setNewSearch] = useState('')
  const messagesEndRef = useRef(null)

  const conversations = data.conversations || []
  const active = conversations.find(cv => cv.id === activeId)
  const myHandle = data.user.handle

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [active?.messages?.length])

  function openConversation(id) {
    setActiveId(id)
    markConversationRead(id)
    setDraft('')
  }

  function handleSend() {
    if (!draft.trim() || !activeId) return
    sendMessage(activeId, draft.trim())
    setDraft('')
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 260px)', minHeight: 400, overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Conversation list */}
      <div style={{ width: 280, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Messages</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
            {conversations.reduce((s, cv) => s + (cv.unread || 0), 0)} unread
          </div>
          <button onClick={() => setShowNew(s => !s)}
            style={{ marginTop: 8, width: '100%', background: showNew ? 'var(--surface-2)' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px', fontSize: 12, cursor: 'pointer' }}>
            {showNew ? '✕ Cancel' : '+ New Message'}
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {showNew && (
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              <input
                autoFocus
                placeholder="Search connections…"
                value={newSearch}
                onChange={e => setNewSearch(e.target.value)}
                style={{ width: '100%', fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)', boxSizing: 'border-box', marginBottom: 6 }}
              />
              {[
                ...(data.connections || []).filter(c => c.status === 'mutual' || c.status === 'following'),
                ...(data.contacts || []).filter(c => c.handle && !(data.connections || []).some(cn => cn.handle === c.handle)),
              ]
                .filter(p => {
                  const q = newSearch.toLowerCase()
                  return !q || p.name.toLowerCase().includes(q) || (p.handle || '').includes(q)
                })
                .map(person => (
                  <div key={person.handle || person.id}
                    onClick={() => {
                      const id = addConversation({ handle: person.handle, name: person.name, avatar: person.avatar })
                      setActiveId(id)
                      markConversationRead(id)
                      setShowNew(false)
                      setNewSearch('')
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', cursor: 'pointer', fontSize: 13, borderRadius: 4 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: person.avatar || AVATAR_COLORS[person.handle] || 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {person.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{person.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>@{person.handle}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
          {conversations.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No messages yet</div>
          )}
          {conversations.map(cv => {
            const bg = AVATAR_COLORS[cv.handle] || 'var(--surface-2)'
            const ini = cv.name.split(' ').map(w => w[0]).join('')
            const isActive = cv.id === activeId
            return (
              <div
                key={cv.id}
                onClick={() => openConversation(cv.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', cursor: 'pointer',
                  background: isActive ? 'var(--surface)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'background .1s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {ini}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: cv.unread > 0 ? 700 : 500, fontSize: 13 }}>{cv.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{timeAgo(cv.timestamp)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {cv.lastMessage}
                    </span>
                    {cv.unread > 0 && (
                      <span style={{ background: 'var(--accent)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8, flexShrink: 0 }}>
                        {cv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat panel */}
      {!active ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text-3)' }}>
          <div style={{ fontSize: 40 }}>💬</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Select a conversation</div>
          <div style={{ fontSize: 12 }}>Choose from the list to start messaging</div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Chat topbar */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: AVATAR_COLORS[active.handle] || 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {active.name.split(' ').map(w => w[0]).join('')}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{active.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>@{active.handle}</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}>
            {active.messages.map(msg => {
              const isMe = msg.from === myHandle
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, marginBottom: 12 }}>
                  <div style={{
                    maxWidth: '68%',
                    background: isMe ? 'var(--accent)' : 'var(--surface)',
                    color: isMe ? '#fff' : 'var(--text)',
                    borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    padding: '9px 14px',
                    fontSize: 13,
                    lineHeight: 1.5,
                    border: isMe ? 'none' : '1px solid var(--border)',
                  }}>
                    <div>{msg.text}</div>
                    <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                      {fmtTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Compose */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
            <input
              className="input"
              placeholder={`Message ${active.name}…`}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={!draft.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
