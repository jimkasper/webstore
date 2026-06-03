import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../store/auth'

type MessageHandler = (data: string) => void

export function useWebSocket(onMessage: MessageHandler) {
  const { accessToken } = useAuth()
  const esRef = useRef<EventSource | null>(null)

  const connect = useCallback(() => {
    if (!accessToken) return
    const es = new EventSource(`/ws`, { withCredentials: true })
    esRef.current = es

    es.onmessage = (e) => onMessage(e.data)
    es.onerror = () => {
      es.close()
      setTimeout(connect, 5000) // reconnect after 5s
    }
  }, [accessToken, onMessage])

  useEffect(() => {
    connect()
    return () => esRef.current?.close()
  }, [connect])
}
