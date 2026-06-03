import { useState } from 'react'

const TIER_CREDITS = { bronze: 20, silver: 30, gold: 70, platinum: 120, diamond: 240 }
const TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
const TIER_COLOR = { bronze: 'tier-bronze', silver: 'tier-silver', gold: 'tier-gold', platinum: 'tier-platinum', diamond: 'tier-diamond' }

const EMOJI_OPTIONS = [
  '🏆','🥇','🥈','🥉','⭐','🌟','💫','🎯','🎖','🏅','🎗','🔥',
  '💪','🚀','🧠','💡','🌱','🌿','🎓','📚','✅','🎉','🎊','💎',
]

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 5 }}>{hint}</div>}
      {children}
    </div>
  )
}

export default function AchievementBuilder({ goals = [], plans = [], routines = [], onSave, onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [badge, setBadge] = useState('🏆')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [tier, setTier] = useState('gold')
  const [credits, setCredits] = useState(TIER_CREDITS.gold)
  const [triggerType, setTriggerType] = useState('manual')
  const [triggerValue, setTriggerValue] = useState(1)
  const [triggerEntityId, setTriggerEntityId] = useState('')

  function handleTierChange(t) {
    setTier(t)
    setCredits(TIER_CREDITS[t])
  }

  function handleSave() {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      description: description.trim(),
      badge,
      tier,
      credits,
      isCustom: true,
      earned: false,
      triggerType,
      triggerValue: triggerType !== 'manual' ? (parseInt(triggerValue) || 1) : null,
      triggerEntityId: triggerType !== 'manual' ? (triggerEntityId || null) : null,
    })
  }

  const triggerOptions = [
    { type: 'tasks',    label: '✅ Complete N tasks in a plan',         valueLabel: 'Tasks to complete', entity: 'plan' },
    { type: 'progress', label: '📊 Reach X% progress on a goal',        valueLabel: 'Progress %',         entity: 'goal' },
    { type: 'streak',  label: '🔥 Maintain N-week streak on a routine', valueLabel: 'Weeks',              entity: 'routine' },
    { type: 'manual',  label: '🖐 Manual — I\'ll mark it earned myself', valueLabel: null,                 entity: null },
  ]

  const activeTrigger = triggerOptions.find(t => t.type === triggerType)

  const entityList = {
    plan:    plans,
    goal:    goals,
    routine: routines,
  }[activeTrigger?.entity] ?? []

  return (
    <div>
      <Field label="Achievement name">
        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. 5K Finisher, Budget Champion" autoFocus />
      </Field>

      <Field label="Description (optional)">
        <textarea className="input" rows={2} value={description} onChange={e => setDescription(e.target.value)}
          placeholder="What does earning this mean?" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
      </Field>

      <Field label="Badge emoji">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setShowEmojiPicker(p => !p)}
            style={{ fontSize: 28, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
            {badge}
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Click to change</span>
        </div>
        {showEmojiPicker && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6, padding: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => { setBadge(e); setShowEmojiPicker(false) }}
                style={{ fontSize: 22, background: badge === e ? 'var(--accent-bg)' : 'transparent', border: `1px solid ${badge === e ? 'rgba(167,139,250,.4)' : 'transparent'}`, borderRadius: 6, padding: '4px 6px', cursor: 'pointer' }}>
                {e}
              </button>
            ))}
          </div>
        )}
      </Field>

      <Field label="Tier">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {TIERS.map(t => (
            <button key={t} onClick={() => handleTierChange(t)}
              className={`btn btn-sm ${tier === t ? 'btn-primary' : 'btn-ghost'}`}
              style={{ textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Credits earned:</span>
          <input type="number" min={1} max={999} value={credits} onChange={e => setCredits(parseInt(e.target.value) || 0)}
            style={{ width: 70, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', color: 'var(--text)', fontSize: 12, textAlign: 'center' }} />
        </div>
      </Field>

      <Field label="Trigger condition" hint="When should this achievement be awarded?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {triggerOptions.map(opt => (
            <label key={opt.type}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: triggerType === opt.type ? 'var(--accent-bg)' : 'var(--surface-2)', border: `1px solid ${triggerType === opt.type ? 'rgba(167,139,250,.35)' : 'transparent'}` }}
              onClick={() => { setTriggerType(opt.type); setTriggerEntityId('') }}>
              <input type="radio" checked={triggerType === opt.type} onChange={() => {}} style={{ accentColor: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 13 }}>{opt.label}</span>
            </label>
          ))}
        </div>
      </Field>

      {triggerType !== 'manual' && activeTrigger && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: '0 0 90px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>{activeTrigger.valueLabel}</div>
            <input type="number" min={1} value={triggerValue} onChange={e => setTriggerValue(e.target.value)} className="input" />
          </div>
          {entityList.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>
                Linked {activeTrigger.entity}
              </div>
              <select className="input" value={triggerEntityId} onChange={e => setTriggerEntityId(e.target.value)}>
                <option value="">-- Optional --</option>
                {entityList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={!name.trim()}>
          Create achievement
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
