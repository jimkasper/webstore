import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../store/auth'
import { connectionsApi } from '../api/connections'
import { useWebSocket } from '../hooks/useWebSocket'
import { SpaceCard } from '../components/SpaceCard'

export function Dashboard() {
  const { space } = useAuth()
  useWebSocket(() => {}) // keep WS alive

  const { data: followers } = useQuery({
    queryKey: ['followers'],
    queryFn: () => connectionsApi.followers(),
  })
  const { data: following } = useQuery({
    queryKey: ['following'],
    queryFn: () => connectionsApi.following(),
  })

  if (!space) return null

  return (
    <div>
      <h1 style={h1}>Dashboard</h1>
      <SpaceCard space={space} />

      <div style={statsRow}>
        <StatCard label="Followers" value={followers?.length ?? 0} />
        <StatCard label="Following" value={following?.length ?? 0} />
      </div>

      <div style={infoBox}>
        <div style={infoLabel}>Your AP Actor URL</div>
        <code style={code}>{window.location.origin}/ap/users/{space.handle}</code>
      </div>
      <div style={infoBox}>
        <div style={infoLabel}>WebFinger</div>
        <code style={code}>{window.location.origin}/.well-known/webfinger?resource=acct:{space.handle}@{window.location.hostname}</code>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={statCard}>
      <div style={{ color: '#84cc16', fontSize: 28, fontWeight: 700 }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: 13 }}>{label}</div>
    </div>
  )
}

const h1: React.CSSProperties = { color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 20 }
const statsRow: React.CSSProperties = { display: 'flex', gap: 16, marginBottom: 24 }
const statCard: React.CSSProperties = {
  flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
  padding: 20, textAlign: 'center',
}
const infoBox: React.CSSProperties = {
  background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
  padding: '14px 18px', marginBottom: 12,
}
const infoLabel: React.CSSProperties = { color: '#64748b', fontSize: 12, marginBottom: 6 }
const code: React.CSSProperties = { color: '#84cc16', fontSize: 12, wordBreak: 'break-all' }
