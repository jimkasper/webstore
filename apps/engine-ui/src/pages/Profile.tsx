import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { spacesApi } from '../api/spaces'
import { useAuth } from '../store/auth'

export function Profile() {
  const { space, setSpace } = useAuth()
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(space?.display_name ?? '')

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: spacesApi.getMe,
  })

  const update = useMutation({
    mutationFn: (name: string) => spacesApi.updateMe(name),
    onSuccess: (updated) => {
      setSpace(updated)
      qc.invalidateQueries({ queryKey: ['me'] })
      setEditing(false)
    },
  })

  const sp = profile ?? space
  if (!sp) return null

  return (
    <div>
      <h1 style={h1}>My SPACE Profile</h1>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: '#84cc16', fontWeight: 700, fontSize: 20 }}>@{sp.handle}</div>
            {editing ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  style={inp}
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Display name"
                />
                <button style={btn} onClick={() => update.mutate(displayName)}>Save</button>
                <button style={ghostBtn} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            ) : (
              <div style={{ color: '#e2e8f0', fontSize: 18, marginTop: 4 }}>{sp.display_name}</div>
            )}
          </div>
          {!editing && (
            <button style={ghostBtn} onClick={() => { setDisplayName(sp.display_name); setEditing(true) }}>Edit</button>
          )}
        </div>

        <div style={section}>
          <div style={label}>Space ID</div>
          <code style={code}>{sp.id}</code>
        </div>
        <div style={section}>
          <div style={label}>Public Key</div>
          <pre style={pre}>{sp.public_key}</pre>
        </div>
        <div style={section}>
          <div style={label}>AP Actor URL</div>
          <code style={code}>{window.location.origin}/ap/users/{sp.handle}</code>
        </div>
        <div style={section}>
          <div style={label}>Member since</div>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>{new Date(sp.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

const h1: React.CSSProperties = { color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 20 }
const card: React.CSSProperties = { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 24 }
const section: React.CSSProperties = { marginTop: 20 }
const label: React.CSSProperties = { color: '#64748b', fontSize: 12, marginBottom: 4 }
const code: React.CSSProperties = { color: '#84cc16', fontSize: 12, wordBreak: 'break-all' }
const pre: React.CSSProperties = { color: '#84cc16', fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }
const inp: React.CSSProperties = {
  background: '#0f172a', border: '1px solid #334155', borderRadius: 6,
  color: '#f1f5f9', padding: '6px 10px', fontSize: 15,
}
const btn: React.CSSProperties = {
  background: '#84cc16', color: '#0f172a', border: 'none', borderRadius: 6,
  padding: '6px 14px', fontWeight: 600, cursor: 'pointer',
}
const ghostBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid #334155', color: '#94a3b8',
  borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13,
}
