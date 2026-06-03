// SSE hook for ENGINE real-time notifications.
// Adapted from apps/engine-ui/src/hooks/useWebSocket.ts.
// Opens EventSource to ENGINE /ws when an auth token is present.
// Auto-reconnects after 5s on disconnect.

import { useEffect, useRef, useCallback } from 'react'
import { useEngineAuth } from '../store/engineAuth.js'

export function useEngineSSE(onMessage) {
  const { accessToken } = useEngineAuth()  // subscribes to React state updates
  const esRef = useRef(null)
  const reconnectRef = useRef(null)

  const connect = useCallback(() => {
    if (!accessToken) return
    if (esRef.current) esRef.current.close()

    // ENGINE /ws accepts token as query param since EventSource has no custom headers
    const es = new EventSource(`/ws?token=${encodeURIComponent(accessToken)}`)
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        onMessage(data)
      } catch {
        onMessage(e.data)
      }
    }

    es.onerror = () => {
      es.close()
      esRef.current = null
      reconnectRef.current = setTimeout(connect, 5000)
    }
  }, [accessToken, onMessage])

  useEffect(() => {
    connect()
    return () => {
      esRef.current?.close()
      clearTimeout(reconnectRef.current)
    }
  }, [connect])
}
