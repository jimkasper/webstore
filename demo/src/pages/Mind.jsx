import { useSearchParams } from 'react-router-dom'
import Planner from './Planner'
import Goals from './Goals'
import Plans from './Plans'
import Routines from './Routines'
import Achievements from './Achievements'
import Scheduler from './Scheduler'
import Journal from './Journal'
import Learning from './Learning'
import JokeJournal from './JokeJournal'
import Kenoma from './Kenoma'

const TABS = [
  { id: 'planner',      icon: '🎯', label: 'Planner',      desc: 'Planning overview & workflow' },
  { id: 'goals',        icon: '🏁', label: 'Goals',         desc: 'Set and track your goals' },
  { id: 'plans',        icon: '📋', label: 'Plans',         desc: 'Task plans for each goal' },
  { id: 'routines',     icon: '🔄', label: 'Routines',      desc: 'Recurring habits & sessions' },
  { id: 'schedule',     icon: '📅', label: 'Schedule',      desc: 'Calendar & events' },
  { id: 'achievements', icon: '🏆', label: 'Achievements',  desc: 'Milestones & credits earned' },
  { id: 'habits',       icon: '🌀', label: 'Habits',        desc: 'Vice & habit tracking (Kenoma)' },
  { id: 'journal',      icon: '📓', label: 'Journal',       desc: 'Daily reflections & mood' },
  { id: 'learning',     icon: '🎓', label: 'Learning',      desc: 'Skills & resources' },
  { id: 'jokes',        icon: '🎤', label: 'Joke Journal',  desc: 'Bits, set lists & performance log' },
]

export default function Mind() {
  const [searchParams, setSearchParams] = useSearchParams()
  const active = searchParams.get('tab') || 'planner'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, padding: '0 8px', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setSearchParams({ tab: t.id })}
            title={t.desc}
            style={{
              padding: '9px 14px', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: active === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: active === t.id ? 'var(--accent)' : 'var(--text-2)',
              fontWeight: active === t.id ? 600 : 400,
              whiteSpace: 'nowrap',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {active === 'planner'      && <Planner />}
        {active === 'goals'        && <Goals />}
        {active === 'plans'        && <Plans />}
        {active === 'routines'     && <Routines />}
        {active === 'schedule'     && <Scheduler />}
        {active === 'achievements' && <Achievements />}
        {active === 'habits'       && <Kenoma />}
        {active === 'journal'      && <Journal />}
        {active === 'learning'     && <Learning />}
        {active === 'jokes'        && <JokeJournal />}
      </div>
    </div>
  )
}
