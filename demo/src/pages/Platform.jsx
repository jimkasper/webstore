import { useNavigate } from 'react-router-dom'

const BUILT = [
  {
    icon: '⬣', label: 'AGORA', path: '/agora', color: '#f97316',
    desc: 'Community discovery, posts, and voting. Find and join communities around shared interests.',
    stats: '10 communities · 12 posts',
  },
  {
    icon: '⬥', label: 'TRADING POST', path: '/store', color: '#84cc16',
    desc: 'Algorithms, themes, blocks, trigger presets, and digital products — buy, install, and trade.',
    stats: '16 listings · 5 categories',
  },
]

const COMING_SOON = [
  {
    icon: '💬', label: 'Messenger', phase: 6,
    desc: 'End-to-end encrypted direct messaging using the Signal Protocol. No server-side logs.',
  },
  {
    icon: '☁️', label: 'Cloud', phase: 7,
    desc: 'Personal file storage (MinIO) + media archiver with yt-dlp. Self-hostable.',
  },
  {
    icon: '🔍', label: 'Hub', phase: 8,
    desc: 'Cross-SPACE search, creator discovery, and advertiser matching across the federation.',
  },
  {
    icon: '🖥️', label: 'Desktop', phase: '4a',
    desc: 'Native desktop app (Tauri 2). TEMPO calendar + contacts + LENS data explorer.',
  },
  {
    icon: '📱', label: 'Mobile', phase: '4b',
    desc: 'Native mobile app (Expo / React Native) for iOS and Android.',
  },
  {
    icon: '🌐', label: 'Browser', phase: 10,
    desc: 'Chromium-based browser with CLOUD integration and LENS data capture from the web.',
  },
]

export default function Platform() {
  const nav = useNavigate()

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      <div className="topbar">
        <div className="topbar-title">⬣ Platform</div>
      </div>
      <div className="scroll">
        <div className="pad">

          {/* Built platforms */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>
              Available Now
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {BUILT.map(p => (
                <div key={p.label} onClick={() => nav(p.path)}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 20px', cursor: 'pointer', transition: 'border-color .15s, transform .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 28, color: p.color }}>{p.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)', letterSpacing: '.04em' }}>{p.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.stats}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>{p.desc}</p>
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: p.color, fontWeight: 600 }}>
                    Open {p.label} →
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coming soon */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>
              Coming Soon
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {COMING_SOON.map(p => (
                <div key={p.label}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px', opacity: 0.65 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{p.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{p.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>Phase {p.phase}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, margin: 0 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
