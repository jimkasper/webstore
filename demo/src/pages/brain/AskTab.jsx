import { useState, useEffect, useRef } from 'react'
import { useStore } from '../../store.jsx'
import { askBrain } from '../../ai/brain.js'

const QUICK_PROMPTS = [
  'Optimize my schedule',
  'What am I neglecting?',
  'How am I tracking toward my goals?',
]

export default function AskTab({ pendingQuery, onQueryConsumed }) {
  const { data } = useStore()
  const brainConfig = data.brainConfig
  const [messages, setMessages] = useState([
    { role: 'brain', text: "Hi! I'm Brain — your personal AI powered by your nTogether data. Ask me anything about your goals, schedule, finances, fitness, or habits." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (pendingQuery) {
      send(pendingQuery)
      onQueryConsumed?.()
    }
  }, [pendingQuery])

  async function send(text) {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q }])
    setLoading(true)
    try {
      const reply = await askBrain(q, data, brainConfig)
      setMessages(m => [...m, { role: 'brain', text: reply }])
    } catch (err) {
      setMessages(m => [...m, { role: 'brain', text: `Error: ${err.message}` }])
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, padding: '12px 24px 0', flexWrap: 'wrap' }}>
        {QUICK_PROMPTS.map(p => (
          <button key={p} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}
            onClick={() => send(p)} disabled={loading}>
            {p}
          </button>
        ))}
      </div>

      <div className="scroll" style={{ flex: 1, padding: '16px 24px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 12,
          }}>
            {m.role === 'brain' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, flexShrink: 0, marginRight: 8, marginTop: 2,
              }}>🧠</div>
            )}
            <div style={{
              maxWidth: '72%',
              background: m.role === 'user' ? 'var(--accent)' : 'var(--surface)',
              color: m.role === 'user' ? '#fff' : 'var(--text)',
              border: m.role === 'user' ? 'none' : '1px solid var(--border)',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '10px 14px', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap',
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🧠</div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13, color: 'var(--text-3)' }}>
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '12px 24px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <input className="input" style={{ flex: 1 }}
          placeholder="Ask Brain anything about your data…"
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={loading} />
        <button className="btn btn-primary btn-sm" onClick={() => send()}
          disabled={!input.trim() || loading}>
          Ask Brain
        </button>
      </div>
    </div>
  )
}
