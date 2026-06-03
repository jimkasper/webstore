import { useSearchParams } from 'react-router-dom'
import Fitness from './Fitness'
import Health from './Health'
import Diet from './Diet'

const TABS = [
  { id: 'fitness', icon: '💪', label: 'Fitness', desc: 'Workouts, runs & PRs' },
  { id: 'health',  icon: '🏥', label: 'Health',  desc: 'Sleep, weight & vitals' },
  { id: 'diet',    icon: '🥗', label: 'Diet',    desc: 'Meals & macros' },
]

export default function Body() {
  const [searchParams, setSearchParams] = useSearchParams()
  const active = searchParams.get('tab') || 'fitness'

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
        {active === 'fitness' && <Fitness />}
        {active === 'health'  && <Health />}
        {active === 'diet'    && <Diet />}
      </div>
    </div>
  )
}
