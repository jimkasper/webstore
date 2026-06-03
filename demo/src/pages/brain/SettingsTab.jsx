import { useState, useEffect } from 'react'
import { useStore } from '../../store.jsx'
import { testProvider, loadOnDeviceModel, isOnDeviceReady } from '../../ai/brain.js'

const ANTHROPIC_MODELS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 — Fast' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6 — Balanced' },
  { id: 'claude-opus-4-7', label: 'Opus 4.7 — Powerful' },
]
const OPENAI_MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o mini — Fast' },
  { id: 'gpt-4o', label: 'GPT-4o — Balanced' },
  { id: 'gpt-4.1', label: 'GPT-4.1 — Advanced' },
]
const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash — Fast' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro — Powerful' },
]
const ON_DEVICE_MODELS = [
  { id: 'Phi-3.5-mini-instruct-q4f16_1-MLC', label: 'Phi-3.5 mini — ~2.2 GB · Fast' },
  { id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', label: 'Llama 3.2 3B — ~2 GB · Compact' },
  { id: 'gemma-2-2b-it-q4f16_1-MLC', label: 'Gemma 2 2B — ~1.4 GB · Lightest' },
  { id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC', label: 'Qwen 2.5 7B — ~4.5 GB · Best quality' },
]
const BYOE_PRESETS = [
  { label: 'Ollama', endpoint: 'http://localhost:11434' },
  { label: 'LM Studio', endpoint: 'http://localhost:1234' },
  { label: 'vLLM', endpoint: 'http://localhost:8000' },
]

function modelListFor(provider) {
  if (provider === 'openai') return OPENAI_MODELS
  if (provider === 'gemini') return GEMINI_MODELS
  return ANTHROPIC_MODELS
}

function defaultModelFor(provider) {
  return modelListFor(provider)[0].id
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ selected, onClick, icon, title, description, children }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--surface)', border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)', padding: '16px 18px', marginBottom: 12, cursor: 'pointer',
      boxShadow: selected ? '0 0 0 2px var(--accent)22' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
          background: selected ? 'var(--accent)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
        </div>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{description}</div>
        </div>
      </div>
      {selected && children && (
        <div onClick={e => e.stopPropagation()} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Test button ──────────────────────────────────────────────────────────────
function TestBtn({ config }) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  async function run() {
    setLoading(true); setStatus(null)
    try { await testProvider(config); setStatus('ok') }
    catch (e) { setStatus(e.message) }
    setLoading(false)
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
      <button className="btn btn-ghost btn-sm" onClick={run} disabled={loading} style={{ fontSize: 12 }}>
        {loading ? 'Testing…' : 'Test connection'}
      </button>
      {status === 'ok' && <span style={{ fontSize: 12, color: 'var(--green)' }}>✓ Connected</span>}
      {status && status !== 'ok' && <span style={{ fontSize: 12, color: '#ef4444' }}>✗ {status}</span>}
    </div>
  )
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
export default function SettingsTab() {
  const { data, setBrainConfig } = useStore()
  const cfg = data.brainConfig
  const hasWebGPU = typeof navigator !== 'undefined' && !!navigator.gpu

  const [loadProgress, setLoadProgress] = useState(null)
  const [modelReady, setModelReady] = useState(() => isOnDeviceReady(cfg.onDeviceModel))

  useEffect(() => {
    function handler(e) { setLoadProgress(e.detail) }
    window.addEventListener('brain:progress', handler)
    return () => window.removeEventListener('brain:progress', handler)
  }, [])

  function set(patch) { setBrainConfig(patch) }

  async function handleLoadModel() {
    setModelReady(false)
    setLoadProgress({ text: 'Initialising…', progress: 0 })
    try {
      await loadOnDeviceModel(cfg.onDeviceModel)
      setModelReady(true)
    } catch (e) {
      setLoadProgress({ text: `Failed: ${e.message}`, progress: 0 })
      return
    }
    setLoadProgress(null)
  }

  const byokModels = modelListFor(cfg.byokProvider)

  return (
    <div className="scroll" style={{ flex: 1 }}>
      <div style={{ padding: '20px 24px', maxWidth: 640 }}>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 0, marginBottom: 20 }}>
          Choose where Brain runs. Your data is sent only to the provider you select.
        </p>

        {/* Demo */}
        <Card selected={cfg.provider === 'demo'} onClick={() => set({ provider: 'demo' })}
          icon="🎭" title="Demo mode" description="Smart mock responses — no setup, no API key, no data leaves the browser." />

        {/* BYOK */}
        <Card selected={cfg.provider === 'byok'} onClick={() => set({ provider: 'byok' })}
          icon="🔑" title="Bring Your Own Key" description="Use your own Anthropic, OpenAI, or Gemini API key. Calls go to your private account.">

          {/* Provider toggle */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {[['anthropic', 'Anthropic'], ['openai', 'OpenAI'], ['gemini', 'Gemini']].map(([id, label]) => (
              <button key={id} className={`btn btn-sm ${cfg.byokProvider === id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 12 }}
                onClick={() => set({ byokProvider: id, byokModel: defaultModelFor(id) })}>
                {label}
              </button>
            ))}
          </div>

          {/* Model */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Model</label>
            <select className="input" value={cfg.byokModel}
              onChange={e => set({ byokModel: e.target.value })}>
              {byokModels.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>

          {/* Key */}
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>API key</label>
            <input type="password" className="input" placeholder="sk-ant-… / sk-… / AIza…"
              value={cfg.byokKey} onChange={e => set({ byokKey: e.target.value })} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
            🔒 Stored in your browser only — never sent to nTogether servers.
          </div>

          <TestBtn config={{ ...cfg, provider: 'byok' }} />
        </Card>

        {/* BYOE */}
        <Card selected={cfg.provider === 'byoe'} onClick={() => set({ provider: 'byoe' })}
          icon="🖥️" title="Bring Your Own Endpoint" description="Point Brain at any OpenAI-compatible endpoint — Ollama, LM Studio, vLLM, or your own server.">

          {/* Presets */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {BYOE_PRESETS.map(p => (
              <button key={p.label} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}
                onClick={() => set({ byoeEndpoint: p.endpoint })}>
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Endpoint URL</label>
            <input className="input" placeholder="http://localhost:11434"
              value={cfg.byoeEndpoint} onChange={e => set({ byoeEndpoint: e.target.value })} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Auth key (optional)</label>
            <input type="password" className="input" placeholder="Bearer token or leave empty"
              value={cfg.byoeKey} onChange={e => set({ byoeKey: e.target.value })} />
          </div>
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Model name</label>
            <input className="input" placeholder="llama3.3"
              value={cfg.byoeModel} onChange={e => set({ byoeModel: e.target.value })} />
          </div>

          <TestBtn config={{ ...cfg, provider: 'byoe' }} />
        </Card>

        {/* On-Device */}
        <Card selected={cfg.provider === 'ondevice'} onClick={() => set({ provider: 'ondevice' })}
          icon="📱" title="On-Device (WebLLM)" description="Run a quantized model locally in your browser using WebGPU. No data ever leaves your device.">

          {!hasWebGPU && (
            <div style={{
              background: '#f59e0b22', border: '1px solid #f59e0b55', borderRadius: 'var(--radius-sm)',
              padding: '10px 12px', fontSize: 12, color: '#f59e0b', marginBottom: 12,
            }}>
              ⚠️ WebGPU is not available in this browser. Use Chrome 113+ or Edge 113+ to enable on-device inference.
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Model</label>
            <select className="input" value={cfg.onDeviceModel}
              onChange={e => { set({ onDeviceModel: e.target.value }); setModelReady(false); setLoadProgress(null) }}>
              {ON_DEVICE_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>

          {modelReady
            ? <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>✓ Model ready — Brain is running fully on-device</div>
            : (
              <div>
                <button className="btn btn-primary btn-sm" onClick={handleLoadModel}
                  disabled={!hasWebGPU || !!loadProgress} style={{ fontSize: 12 }}>
                  {loadProgress ? 'Loading…' : 'Load model'}
                </button>
                {loadProgress && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
                      <span>{loadProgress.text}</span>
                      <span>{Math.round((loadProgress.progress ?? 0) * 100)}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                      <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 2, width: `${Math.round((loadProgress.progress ?? 0) * 100)}%`, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                      Weights are cached after the first download.
                    </div>
                  </div>
                )}
              </div>
            )
          }
        </Card>
      </div>
    </div>
  )
}
