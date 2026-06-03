import { useSearchParams } from 'react-router-dom'
import Financial from './Financial'
import Lists from './Lists'
import Agreements from './Agreements'
import Research from './Research'

const TABS = [
  { id: 'financial',  icon: '💰', label: 'Financial',  desc: 'Budget & transactions' },
  { id: 'lists',      icon: '📋', label: 'Lists',       desc: 'Quick & master lists' },
  { id: 'agreements', icon: '🤝', label: 'Agreements',  desc: 'Contracts & commitments' },
  { id: 'research',   icon: '🔬', label: 'Research',    desc: 'Topics, sources & notes' },
]

export default function LifeApps() {
  const [searchParams, setSearchParams] = useSearchParams()
  const active = searchParams.get('tab') || 'financial'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, padding: '0 16px' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setSearchParams({ tab: t.id })}
            title={t.desc}
            style={{
              padding: '9px 18px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: active === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: active === t.id ? 'var(--accent)' : 'var(--text-2)',
              fontWeight: active === t.id ? 600 : 400,
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {active === 'financial'  && <Financial />}
        {active === 'lists'      && <Lists />}
        {active === 'agreements' && <Agreements />}
        {active === 'research'   && <Research />}
      </div>
    </div>
  )
}
