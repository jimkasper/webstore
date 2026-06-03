import { getActiveDemo } from '../store.jsx'

const DEMOS = {
  jordan: { label: 'Jordan Malik', sub: 'Showcase demo', emoji: '🎭' },
  jim:    { label: 'Jim Kasper',   sub: 'My sandbox',    emoji: '🧪' },
}

export default function DemoSwitcher({ compact = false }) {
  const active = getActiveDemo()
  const other  = active === 'jordan' ? 'jim' : 'jordan'
  const cur    = DEMOS[active]
  const oth    = DEMOS[other]

  function switchTo(name) {
    localStorage.setItem('ntogether-active-demo', name)
    window.location.reload()
  }

  if (compact) {
    return (
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{cur.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cur.label}</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{cur.sub}</div>
        </div>
        <button onClick={() => switchTo(other)}
          title={`Switch to ${oth.label}`}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: 4, padding: '3px 8px', fontSize: 10, cursor: 'pointer', flexShrink: 0 }}>
          {oth.emoji} Switch
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {Object.entries(DEMOS).map(([key, d]) => {
        const isActive = key === active
        return (
          <div key={key} onClick={() => !isActive && switchTo(key)} style={{
            flex: 1, padding: '14px 16px', borderRadius: 8,
            border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
            background: isActive ? 'var(--accent-bg)' : 'var(--surface)',
            cursor: isActive ? 'default' : 'pointer',
            transition: 'border-color .15s',
          }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <div style={{ fontSize: 20, marginBottom: 6 }}>{d.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: isActive ? 'var(--accent)' : 'var(--text-1)' }}>{d.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{d.sub}</div>
            {isActive && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>● Active</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
