// EngineAuthGate — wraps the Monogenes (SPACE) shell.
// If ENGINE is reachable and no token exists, shows Login/Register modal.
// If ENGINE is unreachable, passes through silently (demo mode).
// On successful login, patches the main store user fields from the ENGINE profile.

import { useState, useEffect } from 'react'
import { useEngineAuth, engineAuthStore } from '../store/engineAuth.js'
import { engineAuth, isEngineReachable } from '../api/engine.js'
import { useStore } from '../store.jsx'

export default function EngineAuthGate({ children }) {
  const { accessToken, space, setTokens, setSpace, clear } = useEngineAuth()
  const { updateUser } = useStore()

  const [engineAvailable, setEngineAvailable] = useState(null) // null = checking
  const [showModal, setShowModal] = useState(false)
  const [mode, setMode] = useState('login')   // 'login' | 'register'
  const [form, setForm] = useState({ handle: '', display_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check ENGINE reachability once on mount
  useEffect(() => {
    isEngineReachable().then(ok => {
      setEngineAvailable(ok)
      if (ok && !accessToken) setShowModal(true)
    })
  }, [])

  // Sync ENGINE profile → main store user when authenticated
  useEffect(() => {
    if (space) {
      updateUser({ handle: space.handle, name: space.display_name })
    }
  }, [space?.handle])

  function f(key) {
    return e => setForm(p => ({ ...p, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let res
      if (mode === 'register') {
        res = await engineAuth.register({
          handle: form.handle,
          display_name: form.display_name || form.handle,
          email: form.email,
          password: form.password,
        })
      } else {
        res = await engineAuth.login({ handle: form.handle, password: form.password })
      }
      setTokens(res.tokens.access_token, res.tokens.refresh_token)
      setSpace(res.space)
      updateUser({ handle: res.space.handle, name: res.space.display_name })
      setShowModal(false)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleSkip() {
    setShowModal(false)
  }

  function handleLogout() {
    const { refreshToken } = engineAuthStore.getState()
    if (refreshToken) engineAuth.logout(refreshToken).catch(() => {})
    clear()
    setShowModal(true)
  }

  return (
    <>
      {children}

      {/* ENGINE status chip — shown when authenticated */}
      {accessToken && space && (
        <div style={{
          position: 'fixed', bottom: 16, left: 16, zIndex: 200,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '6px 12px',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 11,
          boxShadow: '0 2px 8px rgba(0,0,0,.3)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span style={{ color: 'var(--text-2)' }}>ENGINE</span>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>@{space.handle}</span>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 10, padding: '0 2px' }}
          >
            Sign out
          </button>
        </div>
      )}

      {/* Login / Register modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(0,0,0,.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 380,
          }}>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
                {mode === 'login' ? 'Sign in to Barbelo' : 'Create your Space'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                Connect to the ENGINE network to interact with other users.
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Handle
                <input
                  value={form.handle} onChange={f('handle')} required
                  placeholder="yourhandle"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '7px 10px', color: 'var(--text-1)', fontSize: 13 }}
                />
              </label>

              {mode === 'register' && (
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                  Display Name
                  <input
                    value={form.display_name} onChange={f('display_name')}
                    placeholder="Your Name"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '7px 10px', color: 'var(--text-1)', fontSize: 13 }}
                  />
                </label>
              )}

              {mode === 'register' && (
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                  Email
                  <input
                    value={form.email} onChange={f('email')} type="email" required
                    placeholder="you@example.com"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '7px 10px', color: 'var(--text-1)', fontSize: 13 }}
                  />
                </label>
              )}

              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Password
                <input
                  value={form.password} onChange={f('password')} type="password" required
                  placeholder="••••••••"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '7px 10px', color: 'var(--text-1)', fontSize: 13 }}
                />
              </label>

              {error && (
                <div style={{ fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,.1)', borderRadius: 4, padding: '6px 10px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="btn btn-primary"
                style={{ marginTop: 4, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Space'}
              </button>
            </form>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}
              >
                {mode === 'login' ? 'New? Create a Space →' : '← Back to sign in'}
              </button>
              <button
                onClick={handleSkip}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12 }}
              >
                Continue as demo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
