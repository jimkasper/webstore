// ENGINE API client — plain JS adaptation of apps/engine-ui/src/api/
// All calls go through the /api proxy → http://localhost:8080 in dev

import { engineAuthStore } from '../store/engineAuth.js'

const BASE = '/api/v1'

async function request(path, options = {}) {
  const { accessToken } = engineAuthStore.getState()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  const res = await fetch(BASE + path, { ...options, headers })

  if (res.status === 401) {
    const { refreshToken } = engineAuthStore.getState()
    if (refreshToken) {
      const refreshRes = await fetch(BASE + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        engineAuthStore.setTokens(data.tokens.access_token, data.tokens.refresh_token)
        headers['Authorization'] = `Bearer ${data.tokens.access_token}`
        const retry = await fetch(BASE + path, { ...options, headers })
        if (!retry.ok) throw new Error(await retry.text())
        if (retry.status === 204) return undefined
        return retry.json()
      }
    }
    engineAuthStore.clear()
    throw new Error('unauthorized')
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  if (res.status === 204) return undefined
  return res.json()
}

const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (path, body) => request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  del: (path, body) => request(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
}

export const engineAuth = {
  register: (body) => api.post('/auth/register', body),
  login: (body) => api.post('/auth/login', body),
  logout: (refresh_token) => api.del('/auth/logout', { refresh_token }),
  me: () => api.get('/me'),
}

export const engineConnections = {
  follow: (handle) => api.post(`/connections/follow/${handle}`),
  unfollow: (handle) => api.del(`/connections/follow/${handle}`),
  followers: (limit = 50, offset = 0) => api.get(`/connections/followers?limit=${limit}&offset=${offset}`),
  following: (limit = 50, offset = 0) => api.get(`/connections/following?limit=${limit}&offset=${offset}`),
}

export const engineSpaces = {
  getProfile: (handle) => api.get(`/spaces/${handle}`),
}

// Probe whether ENGINE is reachable. Used by EngineAuthGate to decide whether
// to show the login flow or fall through to demo mode.
export async function isEngineReachable() {
  const url = (import.meta.env.VITE_ENGINE_URL || '') + '/api/v1/me'
  try {
    const res = await fetch('/api/v1/me', { signal: AbortSignal.timeout(2000) })
    // 401 means server is up (just not authed) — that's fine
    return res.status !== 0
  } catch {
    return false
  }
}
