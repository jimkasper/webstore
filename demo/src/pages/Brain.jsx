import { useState } from 'react'
import { useStore } from '../store.jsx'
import AskTab from './brain/AskTab.jsx'
import LensTab from './brain/LensTab.jsx'
import ConflictsTab from './brain/ConflictsTab.jsx'
import DatapointsTab from './brain/DatapointsTab.jsx'
import SettingsTab from './brain/SettingsTab.jsx'

function providerLabel(cfg) {
  if (!cfg || cfg.provider === 'demo') return 'Demo mode'
  if (cfg.provider === 'byok') {
    const name = { anthropic: 'Anthropic', openai: 'OpenAI', gemini: 'Gemini' }[cfg.byokProvider] || 'BYOK'
    const model = cfg.byokModel?.split('-').slice(1, 3).join('-') || ''
    return `${name} · ${model}`
  }
  if (cfg.provider === 'byoe') return `Custom · ${cfg.byoeModel || 'endpoint'}`
  if (cfg.provider === 'ondevice') {
    const label = cfg.onDeviceModel?.split('-').slice(0, 2).join(' ') || 'On-Device'
    return `${label} · On-Device`
  }
  return 'Demo mode'
}

const TABS = [
  { id: 'ask',        label: '💬 Ask' },
  { id: 'lens',       label: '🔭 LENS' },
  { id: 'conflicts',  label: '⚠️ Conflicts' },
  { id: 'datapoints', label: '📊 Datapoints' },
  { id: 'settings',   label: '⚙️ Settings' },
]

export default function Brain() {
  const { data } = useStore()
  const [tab, setTab] = useState('ask')
  const [pendingQuery, setPendingQuery] = useState('')
  const cfg = data.brainConfig

  function handleQuery(q) {
    setPendingQuery(q)
    setTab('ask')
  }

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>🧠</span>
        <div className="topbar-title">Brain</div>
        <div className="topbar-sep" />
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
          AI-powered insights from your nTogether data
        </span>
        <div className="topbar-right">
          <span className="badge badge-surface" style={{ fontSize: 11 }}>{providerLabel(cfg)}</span>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, padding: '8px 24px 0', borderBottom: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id}
            className={`btn btn-ghost btn-sm ${tab === t.id ? 'active' : ''}`}
            style={{
              borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
              paddingBottom: 10,
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              fontSize: 13,
            }}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tab === 'ask'        && <AskTab pendingQuery={pendingQuery} onQueryConsumed={() => setPendingQuery('')} />}
        {tab === 'lens'       && <LensTab />}
        {tab === 'conflicts'  && <ConflictsTab />}
        {tab === 'datapoints' && <DatapointsTab onQuery={handleQuery} />}
        {tab === 'settings'   && <SettingsTab />}
      </div>
    </div>
  )
}
