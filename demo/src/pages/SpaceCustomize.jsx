import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

const PURPOSES = ['Personal', 'Content Creator', 'Professional', 'Music', 'Photography', 'Writing', 'Tech', 'Fitness', 'Travel', 'Foodie', 'Art']

const THEMES = [
  { id: 'default',  label: 'Default',  desc: 'Lime accent + dark',     accent: '#84cc16', bg: '#0f172a', surface: '#1e293b' },
  { id: 'midnight', label: 'Midnight', desc: 'Deep navy, indigo',       accent: '#6366f1', bg: '#0f0f1a', surface: '#1a1a2e' },
  { id: 'sage',     label: 'Sage',     desc: 'Forest green, soft',      accent: '#4ade80', bg: '#0d1f14', surface: '#122016' },
  { id: 'sunset',   label: 'Sunset',   desc: 'Warm amber + coral',      accent: '#fb923c', bg: '#1a0f0a', surface: '#2a1a12' },
  { id: 'stone',    label: 'Stone',    desc: 'Monochrome, off-white',   accent: '#e5e7eb', bg: '#111111', surface: '#1c1c1c' },
  { id: 'neon',     label: 'Neon',     desc: 'Hot pink + electric blue', accent: '#f472b6', bg: '#0a0a1a', surface: '#111128' },
]

const LAYOUTS = [
  { id: 'classic',  label: 'Classic',  desc: 'Cover photo + avatar left, content right' },
  { id: 'centered', label: 'Centered', desc: 'Avatar centered, banner behind' },
  { id: 'minimal',  label: 'Minimal',  desc: 'No cover, just avatar + bio' },
  { id: 'wide',     label: 'Wide',     desc: 'Full-width feed, sidebar right' },
]

export default function SpaceCustomize() {
  const nav = useNavigate()
  const { data, updateUser } = useStore()
  const u = data.user

  const [step, setStep] = useState(1)
  const [purposes, setPurposes] = useState(u.purposes || [])
  const [theme, setTheme] = useState(u.spaceTheme || 'default')
  const [layout, setLayout] = useState(u.spaceLayout || 'classic')

  function togglePurpose(p) {
    setPurposes(prev => prev.includes(p) ? prev.filter(x => x !== p) : prev.length < 3 ? [...prev, p] : prev)
  }

  function handleSave() {
    updateUser({ purposes, spaceTheme: theme, spaceLayout: layout })
    nav('/monogenes')
  }

  const selectedTheme = THEMES.find(t => t.id === theme) || THEMES[0]

  return (
    <div style={shell}>
      <div style={card}>
        {/* Header */}
        <div style={header}>
          <button style={backBtn} onClick={() => nav('/monogenes')}>← Back</button>
          <div style={title}>Customize Your SPACE</div>
          <div style={stepIndicator}>Step {step} of 3</div>
        </div>

        {/* Step dots */}
        <div style={dots}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ ...dot, background: step >= n ? '#84cc16' : '#334155' }} />
          ))}
        </div>

        {/* Step 1 — Purpose */}
        {step === 1 && (
          <div>
            <div style={stepTitle}>What's your SPACE for?</div>
            <div style={stepSub}>Pick up to 3 purposes that describe your SPACE.</div>
            <div style={chipGrid}>
              {PURPOSES.map(p => (
                <button
                  key={p}
                  style={{ ...chip, ...(purposes.includes(p) ? chipActive : {}) }}
                  onClick={() => togglePurpose(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Theme */}
        {step === 2 && (
          <div>
            <div style={stepTitle}>Choose a theme</div>
            <div style={stepSub}>Pick a color palette for your SPACE.</div>
            <div style={themeGrid}>
              {THEMES.map(t => (
                <button
                  key={t.id}
                  style={{ ...themeCard, ...(theme === t.id ? themeCardActive : {}), background: t.surface, borderColor: theme === t.id ? t.accent : '#334155' }}
                  onClick={() => setTheme(t.id)}
                >
                  {/* Mini profile preview */}
                  <div style={{ background: t.bg, borderRadius: 6, padding: 10, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.accent, marginBottom: 6, opacity: 0.9 }} />
                    <div style={{ height: 6, width: '60%', background: '#fff', opacity: 0.7, borderRadius: 3, marginBottom: 4 }} />
                    <div style={{ height: 4, width: '40%', background: t.accent, borderRadius: 3, opacity: 0.8 }} />
                  </div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>{t.label}</div>
                  <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{t.desc}</div>
                  {theme === t.id && (
                    <div style={{ color: t.accent, fontSize: 10, fontWeight: 700, marginTop: 4 }}>✓ Selected</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Layout */}
        {step === 3 && (
          <div>
            <div style={stepTitle}>Choose a layout</div>
            <div style={stepSub}>How should your profile page be arranged?</div>
            <div style={layoutGrid}>
              {LAYOUTS.map(l => (
                <button
                  key={l.id}
                  style={{ ...layoutCard, ...(layout === l.id ? layoutCardActive : {}) }}
                  onClick={() => setLayout(l.id)}
                >
                  <div style={{ fontWeight: 600, color: layout === l.id ? '#84cc16' : '#f1f5f9', fontSize: 14, marginBottom: 4 }}>{l.label}</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{l.desc}</div>
                  {layout === l.id && (
                    <div style={{ color: '#84cc16', fontSize: 11, fontWeight: 700, marginTop: 6 }}>✓ Selected</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={btnRow}>
          {step > 1 && (
            <button style={ghostBtn} onClick={() => setStep(s => s - 1)}>Back</button>
          )}
          <div style={{ flex: 1 }} />
          {step < 3 ? (
            <button style={primaryBtn} onClick={() => setStep(s => s + 1)}>
              Next →
            </button>
          ) : (
            <button style={primaryBtn} onClick={handleSave}>
              Save SPACE
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const shell = { minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px' }
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 32, width: '100%', maxWidth: 640 }
const header = { display: 'flex', alignItems: 'center', marginBottom: 24 }
const backBtn = { background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, padding: 0, marginRight: 12 }
const title = { flex: 1, color: '#f1f5f9', fontWeight: 700, fontSize: 18 }
const stepIndicator = { color: '#64748b', fontSize: 12 }
const dots = { display: 'flex', gap: 8, marginBottom: 28 }
const dot = { width: 8, height: 8, borderRadius: '50%', transition: 'background 0.2s' }
const stepTitle = { color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginBottom: 6 }
const stepSub = { color: '#64748b', fontSize: 13, marginBottom: 20 }
const chipGrid = { display: 'flex', flexWrap: 'wrap', gap: 8 }
const chip = { background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', borderRadius: 20, padding: '6px 14px', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }
const chipActive = { background: '#1a2e0a', borderColor: '#84cc16', color: '#84cc16' }
const themeGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }
const themeCard = { border: '2px solid #334155', borderRadius: 10, padding: 12, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }
const themeCardActive = { background: '#1a2032' }
const layoutGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }
const layoutCard = { background: '#0f172a', border: '2px solid #334155', borderRadius: 10, padding: 16, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }
const layoutCardActive = { borderColor: '#84cc16', background: '#0f1f0a' }
const btnRow = { display: 'flex', alignItems: 'center', marginTop: 32 }
const primaryBtn = { background: '#84cc16', color: '#0f172a', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }
const ghostBtn = { background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }
