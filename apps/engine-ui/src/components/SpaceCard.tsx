import type { SpaceProfile } from '../api/auth'

interface Props {
  space: SpaceProfile
}

export function SpaceCard({ space }: Props) {
  return (
    <div style={card}>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#84cc16' }}>@{space.handle}</div>
      <div style={{ color: '#e2e8f0', marginTop: 4 }}>{space.display_name}</div>
      <div style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
        ID: {space.id.slice(0, 8)}… · Joined {new Date(space.created_at).toLocaleDateString()}
      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
  padding: '16px 20px', marginBottom: 12,
}
