import { useSearchParams } from 'react-router-dom'
import Contacts from './Contacts'
import Media from './Media'
import AroundTown from './AroundTown'
import Posthumous from './Posthumous'
import Draft from './Draft'

const TABS = [
  { id: 'contacts',   icon: '👤', label: 'Contacts',    desc: 'People & relationships' },
  { id: 'media',      icon: '🎬', label: 'Media',        desc: 'Books, films & albums' },
  { id: 'aroundtown', icon: '📍', label: 'Around Town',  desc: 'Places, check-ins & saves' },
  { id: 'posthumous', icon: '🕯️', label: 'Posthumous',  desc: 'Legacy messages & access' },
  { id: 'draft',      icon: '🎲', label: 'Draft',        desc: 'Snake draft rooms' },
]

export default function World() {
  const [searchParams, setSearchParams] = useSearchParams()
  const active = searchParams.get('tab') || 'contacts'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, padding: '0 16px', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setSearchParams({ tab: t.id })}
            title={t.desc}
            style={{
              padding: '9px 16px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              borderBottom: active === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: active === t.id ? 'var(--accent)' : 'var(--text-2)',
              fontWeight: active === t.id ? 600 : 400,
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {active === 'contacts'   && <Contacts />}
        {active === 'media'      && <Media />}
        {active === 'aroundtown' && <AroundTown />}
        {active === 'posthumous' && <Posthumous />}
        {active === 'draft'      && <Draft />}
      </div>
    </div>
  )
}
