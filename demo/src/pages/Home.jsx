import { useNavigate } from 'react-router-dom'
import DemoSwitcher from '../components/DemoSwitcher.jsx'
import { getActiveDemo } from '../store.jsx'

const AUTOGENES_CATEGORIES = [
  {
    icon: '🏃', label: 'Body', color: '#22c55e',
    path: '/autogenes/body',
    apps: [
      { icon: '💪', label: 'Fitness',      path: '/autogenes/body?tab=fitness',  desc: 'Workouts, runs & PRs' },
      { icon: '🏥', label: 'Health',       path: '/autogenes/body?tab=health',   desc: 'Sleep, weight & vitals' },
      { icon: '🥗', label: 'Diet',         path: '/autogenes/body?tab=diet',     desc: 'Meals & macros' },
    ],
  },
  {
    icon: '🧩', label: 'Mind', color: '#a78bfa',
    path: '/autogenes/mind',
    apps: [
      { icon: '🎯', label: 'Planner',      path: '/autogenes/mind?tab=planner',      desc: 'Goals & plans overview' },
      { icon: '🏁', label: 'Goals',        path: '/autogenes/mind?tab=goals',        desc: 'Set & track goals' },
      { icon: '📋', label: 'Plans',        path: '/autogenes/mind?tab=plans',        desc: 'Break goals into tasks' },
      { icon: '🔄', label: 'Routines',     path: '/autogenes/mind?tab=routines',     desc: 'Recurring habits' },
      { icon: '📅', label: 'Schedule',     path: '/autogenes/mind?tab=schedule',     desc: 'Calendar & events' },
      { icon: '🏆', label: 'Achievements', path: '/autogenes/mind?tab=achievements', desc: 'Milestones & credits' },
      { icon: '📓', label: 'Journal',      path: '/autogenes/mind?tab=journal',      desc: 'Reflections & mood' },
      { icon: '🎓', label: 'Learning',      path: '/autogenes/mind?tab=learning',     desc: 'Skills & resources' },
      { icon: '🎤', label: 'Joke Journal', path: '/autogenes/mind?tab=jokes',        desc: 'Bits, sets & log' },
      { icon: '🌀', label: 'Habit (Kenoma)', path: '/autogenes/mind?tab=habits',    desc: 'Vice & habit tracking' },
    ],
  },
  {
    icon: '💼', label: 'Life', color: '#f59e0b',
    path: '/autogenes/money',
    apps: [
      { icon: '💰', label: 'Financial',   path: '/autogenes/money?tab=financial',  desc: 'Budget & transactions' },
      { icon: '📝', label: 'Lists',       path: '/autogenes/money?tab=lists',      desc: 'Tasks & to-dos' },
      { icon: '🤝', label: 'Agreements',  path: '/autogenes/money?tab=agreements', desc: 'Contracts & commitments' },
      { icon: '🔬', label: 'Research',    path: '/autogenes/money?tab=research',   desc: 'Notes & saved sources' },
    ],
  },
  {
    icon: '🌍', label: 'World', color: '#60a5fa',
    path: '/autogenes/world',
    apps: [
      { icon: '👤', label: 'Contacts',    path: '/autogenes/world?tab=contacts',   desc: 'People & relationships' },
      { icon: '🎬', label: 'Media',       path: '/autogenes/world?tab=media',      desc: 'Books, films & podcasts' },
      { icon: '🗺',  label: 'Around Town', path: '/autogenes/world?tab=aroundtown', desc: 'Local spots & check-ins' },
      { icon: '📜', label: 'Posthumous',  path: '/autogenes/world?tab=posthumous', desc: 'Legacy & final wishes' },
      { icon: '✉️', label: 'Draft',       path: '/autogenes/world?tab=draft',      desc: 'Letters & timed sends' },
    ],
  },
  {
    icon: '🤖', label: 'Brain', color: '#84cc16',
    path: '/autogenes/brain',
    apps: [
      { icon: '🧠', label: 'Ask',         path: '/autogenes/brain',              desc: 'AI queries & chat' },
      { icon: '🔍', label: 'Lens',        path: '/autogenes/brain',              desc: 'SQL data explorer' },
      { icon: '⚡', label: 'Conflicts',   path: '/autogenes/brain',              desc: 'Goal & schedule conflicts' },
      { icon: '📊', label: 'Datapoints',  path: '/autogenes/brain',              desc: 'Raw life metrics' },
    ],
  },
]

const MONOGENES_APPS = [
  { icon: '🏠', label: 'Profile',        path: '/monogenes',                  desc: 'Wall, about & achievements' },
  { icon: '📡', label: 'Feed',           path: '/monogenes/feed',             desc: 'Social feed & compose' },
  { icon: '🤝', label: 'Connections',    path: '/monogenes/connections',      desc: 'Follow & discover people' },
  { icon: '💬', label: 'Messages',       path: '/monogenes/messages',         desc: 'Direct messages' },
  { icon: '🔔', label: 'Notifications',  path: '/monogenes/notifications',    desc: 'Activity & mentions' },
  { icon: '👥', label: 'Groups',         path: '/monogenes/groups',           desc: 'Communities & group feeds' },
  { icon: '✦',  label: 'BUILDMONOGENES', path: '/monogenes/editor',           desc: 'Visual page & block editor' },
]

const PLATFORM_APPS = [
  { icon: '⊞',  label: 'DASH',         path: '/dash',     color: '#6366f1', desc: 'Unified analytics dashboard' },
  { icon: '⬣',  label: 'AGORA',        path: '/platform', color: '#f97316', desc: 'Community discovery & voting' },
  { icon: '🏪', label: 'TRADING POST', path: '/store',    color: '#84cc16', desc: 'Algorithms, themes & blocks' },
]

const WORKFLOW = [
  { icon: '🎯', label: 'Goal',     desc: '"Gym 3× per week"' },
  { icon: '🔄', label: 'Routine',  desc: 'Mon · Wed · Fri 7am' },
  { icon: '📅', label: 'Schedule', desc: 'Auto-populated blocks' },
  { icon: '📓', label: 'Journal',  desc: 'Post-event reflection' },
  { icon: '🧠', label: 'Brain',    desc: 'AI data & insights' },
]

function AppCard({ app, accentColor, nav }) {
  return (
    <div
      onClick={() => nav(app.path)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 4,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '11px 14px',
        cursor: 'pointer', flex: '1 1 130px', minWidth: 0,
        transition: 'border-color .15s, transform .12s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accentColor || 'var(--accent)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = ''
      }}
    >
      <span style={{ fontSize: 20, lineHeight: 1 }}>{app.icon}</span>
      <span style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{app.label}</span>
      <span style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>{app.desc}</span>
    </div>
  )
}

function CategorySection({ cat, nav }) {
  const totalApps = cat.apps.length
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: `${cat.color}18`, border: `1px solid ${cat.color}40`,
          borderRadius: 999, padding: '4px 12px 4px 8px',
        }}>
          <span style={{ fontSize: 15 }}>{cat.icon}</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: cat.color }}>{cat.label}</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{totalApps} app{totalApps !== 1 ? 's' : ''}</span>
        <button
          onClick={() => nav(cat.path)}
          style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = cat.color}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >
          Open {cat.label} →
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {cat.apps.map(app => (
          <AppCard key={app.label} app={app} accentColor={cat.color} nav={nav} />
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const nav = useNavigate()
  const totalApps = AUTOGENES_CATEGORIES.reduce((n, c) => n + c.apps.length, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: 860, width: '100%' }}>

        {/* Logo + hero */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff' }}>n</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.02em' }}>Barbelo</div>
              <div style={{ color: 'var(--text-3)', fontSize: 13 }}>
                {getActiveDemo() === 'jordan' ? 'Showcase Demo — Jordan Malik @jordan' : 'Sandbox — Jim Kasper @jim'}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 24px' }}>
            A privacy-first platform where your goals, schedule, journal, and social life work together.
            {getActiveDemo() === 'jordan' ? ' Pre-seeded with Jordan\'s 3+ months of data.' : ' Blank slate — start fresh and explore.'}
          </p>

          <div style={{ maxWidth: 420, margin: '0 auto 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: 8 }}>Active Demo</div>
            <DemoSwitcher />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <button className="btn btn-primary" style={{ fontSize: 14, padding: '10px 22px' }} onClick={() => nav('/dash')}>⊞ Dashboard</button>
            <button className="btn btn-ghost"   style={{ fontSize: 14, padding: '10px 22px' }} onClick={() => nav('/monogenes')}>🏠 Monogenes</button>
            <button className="btn btn-ghost"   style={{ fontSize: 14, padding: '10px 22px' }} onClick={() => nav('/autogenes/brain')}>🤖 Brain</button>
            <button className="btn btn-ghost btn-sm" onClick={() => nav('/autogenes/mind?tab=planner')}>🎯 Goals</button>
            <button className="btn btn-ghost btn-sm" onClick={() => nav('/monogenes/feed')}>📡 Feed</button>
            <button className="btn btn-ghost btn-sm" onClick={() => nav('/platform')}>⬣ Platform</button>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => nav('/monogenes/setup')}
              style={{ background: 'linear-gradient(135deg,#84cc16,#4ade80)', color: '#0f172a', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: '.02em' }}
            >
              ✦ Set up your Monogenes →
            </button>
          </div>
        </div>

        {/* Core workflow */}
        <div style={{ marginBottom: 44 }}>
          <div className="section-title" style={{ marginBottom: 14, textAlign: 'center' }}>The core workflow</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {WORKFLOW.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', textAlign: 'center', minWidth: 96 }}>
                  <div style={{ fontSize: 20, marginBottom: 3 }}>{step.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{step.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{step.desc}</div>
                </div>
                {i < WORKFLOW.length - 1 && <div style={{ color: 'var(--text-3)', fontSize: 16 }}>→</div>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '0 0 36px' }} />

        {/* Autogenes — categorical app list */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div className="section-title" style={{ margin: 0 }}>Autogenes</div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '2px 8px' }}>
              {AUTOGENES_CATEGORIES.length} categories · {totalApps} apps
            </span>
          </div>
          {AUTOGENES_CATEGORIES.map(cat => (
            <CategorySection key={cat.label} cat={cat} nav={nav} />
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '0 0 36px' }} />

        {/* Monogenes */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="section-title" style={{ margin: 0 }}>Monogenes</div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '2px 8px' }}>Social · online presence</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MONOGENES_APPS.map(app => (
              <AppCard key={app.label} app={app} accentColor="var(--accent)" nav={nav} />
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '0 0 36px' }} />

        {/* Platform */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="section-title" style={{ margin: 0 }}>Platform</div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '2px 8px' }}>Analytics · Communities · Marketplace</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PLATFORM_APPS.map(app => (
              <div key={app.label} onClick={() => nav(app.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '14px 18px',
                  cursor: 'pointer', flex: '1 1 200px',
                  transition: 'border-color .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = app.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${app.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, color: app.color }}>
                  {app.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', letterSpacing: '.04em' }}>{app.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{app.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
          {getActiveDemo() === 'jordan'
            ? 'Jordan Malik · @jordan · Software Developer, Seattle · T3 · 340 credits · 3 months of data'
            : 'Jim Kasper · @jim · Blank slate — add your own data'}
        </p>
      </div>
    </div>
  )
}
