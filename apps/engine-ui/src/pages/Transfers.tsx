import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { transfersApi } from '../api/transfers'

export function Transfers() {
  const [toHandle, setToHandle] = useState('')
  const [payload, setPayload] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [lookupId, setLookupId] = useState('')

  const create = useMutation({
    mutationFn: () => transfersApi.create({ to_handle: toHandle, payload: JSON.parse(payload || '{}'), ttl_hours: 24 }),
    onSuccess: (t) => { setResult(JSON.stringify(t, null, 2)); setError('') },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed'),
  })

  const accept = useMutation({
    mutationFn: () => transfersApi.accept(lookupId),
    onSuccess: (data) => { setResult(JSON.stringify(data, null, 2)); setError('') },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed'),
  })

  const cancel = useMutation({
    mutationFn: () => transfersApi.cancel(lookupId),
    onSuccess: () => { setResult('Transfer cancelled and deleted.'); setError('') },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed'),
  })

  return (
    <div>
      <h1 style={h1}>Encrypted Transfers</h1>

      <div style={card}>
        <div style={cardTitle}>Send Transfer</div>
        <label style={lbl}>To handle
          <input style={inp} value={toHandle} onChange={e => setToHandle(e.target.value)} placeholder="alice" />
        </label>
        <label style={lbl}>Payload (JSON)
          <textarea style={{ ...inp, height: 80, resize: 'vertical' }} value={payload} onChange={e => setPayload(e.target.value)} placeholder='{"message": "hello"}' />
        </label>
        {error && <div style={err}>{error}</div>}
        <button style={btn} onClick={() => create.mutate()} disabled={!toHandle || create.isPending}>
          {create.isPending ? 'Encrypting…' : 'Send encrypted transfer'}
        </button>
      </div>

      <div style={card}>
        <div style={cardTitle}>Accept / Cancel by ID</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input style={{ ...inp, flex: 1 }} value={lookupId} onChange={e => setLookupId(e.target.value)} placeholder="transfer UUID" />
          <button style={btn} onClick={() => accept.mutate()} disabled={!lookupId}>Accept + decrypt</button>
          <button style={ghostBtn} onClick={() => cancel.mutate()} disabled={!lookupId}>Cancel</button>
        </div>
      </div>

      {result && (
        <div style={resultBox}>
          <div style={{ color: '#64748b', fontSize: 11, marginBottom: 6 }}>Result</div>
          <pre style={{ color: '#84cc16', fontSize: 12, whiteSpace: 'pre-wrap' }}>{result}</pre>
        </div>
      )}
    </div>
  )
}

const h1: React.CSSProperties = { color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 20 }
const card: React.CSSProperties = { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 20, marginBottom: 16 }
const cardTitle: React.CSSProperties = { fontWeight: 600, color: '#f1f5f9', marginBottom: 14 }
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, color: '#94a3b8', fontSize: 13, marginBottom: 12 }
const inp: React.CSSProperties = { background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#f1f5f9', padding: '8px 12px', fontSize: 14 }
const btn: React.CSSProperties = { background: '#84cc16', color: '#0f172a', border: 'none', borderRadius: 6, padding: '9px 16px', fontWeight: 600, cursor: 'pointer' }
const ghostBtn: React.CSSProperties = { background: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: 6, padding: '9px 16px', cursor: 'pointer' }
const resultBox: React.CSSProperties = { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 20 }
const err: React.CSSProperties = { color: '#f87171', fontSize: 12, marginBottom: 10 }
