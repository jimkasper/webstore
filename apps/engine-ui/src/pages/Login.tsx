import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuth } from '../store/auth'

export function Login() {
  const [handle, setHandle] = useState('')
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
      const res = await authApi.login({ handle, password })
      setTokens(res.tokens.access_token, res.tokens.refresh_token)
      setSpace(res.space)
      nav('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={formWrap}>
      <h1 style={title}>Sign in to ENGINE</h1>
      <form onSubmit={handleSubmit} style={form}>
        <label style={lbl}>Handle
          <input style={inp} value={handle} onChange={e => setHandle(e.target.value)} placeholder="alice" required />
        </label>
        <label style={lbl}>Password
          <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        {error && <div style={errStyle}>{error}</div>}
        <button type="submit" style={btn} disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p style={{ marginTop: 16, color: '#64748b', fontSize: 14 }}>
        No account? <Link to="/register" style={{ color: '#84cc16' }}>Register</Link>
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
