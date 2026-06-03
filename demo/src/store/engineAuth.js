// ENGINE auth store — lightweight localStorage persistence, no external dependencies.
// Provides a React hook (useEngineAuth) and a raw store accessor (engineAuthStore).

import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'engine-auth'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {} }
  catch { return {} }
}

function save(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }
  catch {}
}

let _state = {
  accessToken: null,
  refreshToken: null,
  space: null,
  ...load(),
}

const _listeners = new Set()

function _setState(patch) {
  _state = { ..._state, ...patch }
  save(_state)
  _listeners.forEach(fn => fn(_state))
}

// Raw store — used by non-React code (api/engine.js)
export const engineAuthStore = {
  getState: () => _state,
  setTokens: (accessToken, refreshToken) => _setState({ accessToken, refreshToken }),
  setSpace: (space) => _setState({ space }),
  clear: () => _setState({ accessToken: null, refreshToken: null, space: null }),
  subscribe: (fn) => { _listeners.add(fn); return () => _listeners.delete(fn) },
}

// React hook — returns current state with action methods attached
export function useEngineAuth() {
  const state = useSyncExternalStore(
    engineAuthStore.subscribe,
    engineAuthStore.getState,
  )
  return {
    ...state,
    setTokens: engineAuthStore.setTokens,
    setSpace: engineAuthStore.setSpace,
    clear: engineAuthStore.clear,
  }
}
