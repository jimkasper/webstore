import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { connectionsApi } from '../api/connections'

export function Connections() {
  const qc = useQueryClient()
  const [handle, setHandle] = useState('')
  const [tab, setTab] = useState<'followers' | 'following'>('following')
  const [error, setError] = useState('')

  const { data: followers } = useQuery({ queryKey: ['followers'], queryFn: () => connectionsApi.followers() })
  const { data: following } = useQuery({ queryKey: ['following'], queryFn: () => connectionsApi.following() })

  const follow = useMutation({
    mutationFn: (h: string) => connectionsApi.follow(h),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['following'] }); setHandle(''); setError('') },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed'),
  })

  const items = tab === 'followers' ? followers : following

  return (
    <div>
      <h1 style={h1}>Connections</h1>

      <div style={card}>
        <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>Follow a SPACE</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={inp} value={handle} onChange={e => setHandle(e.target.value)} placeholder="alice" />
          <button style={btn} onClick={() => follow.mutate(handle)} disabled={!handle || follow.isPending}>
            {follow.isPending ? '…' : 'Follow'}
          </button>
        </div>
        {error && <div style={err}>{error}</div>}
      </div>

      <div style={tabs}>
        {(['following', 'followers'] as const).map(t => (
          <button key={t} style={tab === t ? activeTab : tabBtn} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)} ({(t === 'followers' ? followers : following)?.length ?? 0})
          </button>
        ))}
      </div>

      {(items ?? []).length === 0 ? (
        <div style={empty}>No {tab} yet.</div>
      ) : (
        (items ?? []).map((c) => (
          <div key={c.id} style={row}>
            <div>
              <div style={{ color: '#84cc16', fontSize: 13 }}>{c.from_space_id}</div>
              <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>status: {c.status}</div>
            </div>
            {c.status === 'pending' && tab === 'followers' && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={smallBtn} onClick={() => connectionsApi.accept(c.id).then(() => qc.invalidateQueries({ queryKey: ['followers'] }))}>Accept</button>
                <button style={ghostSmall} onClick={() => connectionsApi.reject(c.id).then(() => qc.invalidateQueries({ queryKey: ['followers'] }))}>Reject</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

const h1: React.CSSProperties = { color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 20 }
const card: React.CSSProperties = { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 20, marginBottom: 20 }
const tabs: React.CSSProperties = { display: 'flex', gap: 8, marginBottom: 16 }
const tabBtn: React.CSSProperties = { background: 'transparent', border: '1px solid #334155', color: '#64748b', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }
const activeTab: React.CSSProperties = { ...tabBtn, borderColor: '#84cc16', color: '#84cc16' }
const inp: React.CSSProperties = { flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#f1f5f9', padding: '8px 12px', fontSize: 14 }
const btn: React.CSSProperties = { background: '#84cc16', color: '#0f172a', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }
const row: React.CSSProperties = { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
const empty: React.CSSProperties = { color: '#475569', padding: 20, textAlign: 'center' }
const err: React.CSSProperties = { color: '#f87171', fontSize: 12, marginTop: 8 }
const smallBtn: React.CSSProperties = { background: '#84cc16', color: '#0f172a', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }
const ghostSmall: React.CSSProperties = { background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }
