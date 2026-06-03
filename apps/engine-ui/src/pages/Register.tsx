import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../store/auth'

export function Register() {
  const [handle, setHandle] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setTokens, setSpace } = useAuth()
  const nav = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.register({ handle, display_name: displayName || handle, email, password })
      setTokens(res.tokens.access_token, res.tokens.refresh_token)
      setSpace(res.space)
      nav('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={formWrap}>
      <h1 style={title}>Create a SPACE</h1>
      <form onSubmit={handleSubmit} style={form}>
        <label style={lbl}>Handle <span style={{ color: '#64748b' }}>(unique, no spaces)</span>
          <input style={inp} value={handle} onChange={e => setHandle(e.target.value)} placeholder="alice" required />
        </label>
        <label style={lbl}>Display name
          <input style={inp} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Alice" />
        </label>
        <label style={lbl}>Email <span style={{ color: '#64748b' }}>(stored as hash, never plain)</span>
          <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label style={lbl}>Password
          <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
        </label>
        {error && <div style={errStyle}>{error}</div>}
        <button type="submit" style={btn} disabled={loading}>{loading ? 'Creating…' : 'Create SPACE'}</button>
      </form>
      <p style={{ marginTop: 16, color: '#64748b', fontSize: 14 }}>
        Already have a SPACE? <Link to="/login" style={{ color: '#84cc16' }}>Sign in</Link>
      </p>
    </div>
  )
}

const formWrap: React.CSSProperties = { maxWidth: 400, margin: '80px auto' }
const title: React.CSSProperties = { marginBottom: 24, color: '#f1f5f9', fontSize: 22, fontWeight: 700 }
const form: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 }
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, color: '#94a3b8', fontSize: 14 }
const inp: React.CSSProperties = {
  background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
  color: '#f1f5f9', padding: '10px 14px', fontSize: 15, outline: 'none',
}
const btn: React.CSSProperties = {
  background: '#84cc16', color: '#0f172a', border: 'none', borderRadius: 8,
  padding: '11px', fontWeight: 700, fontSize: 15, cursor: 'pointer',
}
const errStyle: React.CSSProperties = { color: '#f87171', fontSize: 13 }
