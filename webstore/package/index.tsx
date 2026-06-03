import React, { useEffect, useRef } from 'react'

interface WebStoreProps {
  storeUrl: string
  height?: string
  className?: string
}

export function WebStore({ storeUrl, height = '700px', className }: WebStoreProps) {
  const ref = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = ref.current
    if (!iframe) return
    const handler = (e: MessageEvent) => {
      if (e.origin !== storeUrl) return
      if (e.data?.type === 'webstore:resize') iframe.style.height = e.data.height + 'px'
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [storeUrl])

  return (
    <iframe
      ref={ref}
      src={`${storeUrl}/store/embed`}
      style={{ width: '100%', border: 'none', minHeight: height }}
      className={className}
      loading="lazy"
      title="WebStore"
    />
  )
}
