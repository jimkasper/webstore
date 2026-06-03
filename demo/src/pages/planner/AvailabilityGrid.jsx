import { useState } from 'react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
// 6am – 10pm in 30-min slots = 32 slots
const SLOTS = Array.from({ length: 32 }, (_, i) => {
  const totalMins = 6 * 60 + i * 30
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  const ampm = h < 12 ? 'am' : 'pm'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return { index: i, label: m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2,'0')}`, hour: h, min: m }
})

export default function AvailabilityGrid({ sessionMins = 60, sessionsPerWeek = 3, onConfirm, onBrainSuggest }) {
  // grid[dayIndex][slotIndex] = true if available
  const [grid, setGrid] = useState(() => Array.from({ length: 7 }, () => Array(32).fill(false)))
  const [dragging, setDragging] = useState(false)
  const [dragValue, setDragValue] = useState(true)
  const [suggested, setSuggested] = useState([]) // [{day, slot}]

  function toggle(d, s) {
    setGrid(g => g.map((row, di) => di === d ? row.map((v, si) => si === s ? !v : v) : row))
  }

  function onMouseDown(d, s) {
    const newVal = !grid[d][s]
    setDragValue(newVal)
    setDragging(true)
    setGrid(g => g.map((row, di) => di === d ? row.map((v, si) => si === s ? newVal : v) : row))
  }

  function onMouseEnter(d, s) {
    if (!dragging) return
    setGrid(g => g.map((row, di) => di === d ? row.map((v, si) => si === s ? dragValue : v) : row))
  }

  function suggest() {
    // Find blocks of consecutive available slots >= sessionMins/30 for sessionsPerWeek days
    const slotsNeeded = Math.ceil(sessionMins / 30)
    const candidates = []
    grid.forEach((row, d) => {
      let streak = 0
      row.forEach((v, s) => {
        if (v) {
          streak++
          if (streak >= slotsNeeded) {
            candidates.push({ day: d, slot: s - slotsNeeded + 1 })
          }
        } else {
          streak = 0
        }
      })
    })
    // Pick first sessionsPerWeek non-overlapping
    const picks = []
    const usedDays = new Set()
    for (const c of candidates) {
      if (!usedDays.has(c.day) && picks.length < sessionsPerWeek) {
        picks.push(c)
        usedDays.add(c.day)
      }
    }
    setSuggested(picks)
    return picks
  }

  function buildSlots() {
    const result = suggested.length > 0 ? suggested : suggest()
    const slots = result.map(({ day, slot }) => {
      const s = SLOTS[slot]
      const time = `${String(s.hour).padStart(2,'0')}:${String(s.min).padStart(2,'0')}`
      return { day: DAYS[day], time }
    })
    onConfirm(slots)
  }

  const hasSuggestion = suggested.length > 0

  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12 }}>
        Shade the time blocks when you're usually free. We'll find {sessionsPerWeek} slot{sessionsPerWeek !== 1 ? 's' : ''} of {sessionMins} min each.
      </div>

      {/* Grid */}
      <div style={{ overflowX: 'auto', marginBottom: 14 }} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)}>
        <table style={{ borderCollapse: 'collapse', userSelect: 'none', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ width: 36, padding: '2px 4px', color: 'var(--text-3)', fontWeight: 400 }} />
              {DAYS.map(d => (
                <th key={d} style={{ padding: '2px 4px', color: 'var(--text-2)', fontWeight: 600, textAlign: 'center', width: 36 }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot, si) => (
              <tr key={si}>
                <td style={{ padding: '0 4px', color: 'var(--text-3)', whiteSpace: 'nowrap', textAlign: 'right', fontSize: 10, height: 14 }}>
                  {slot.min === 0 ? slot.label : ''}
                </td>
                {DAYS.map((_, di) => {
                  const isSuggested = suggested.some(s => s.day === di && si >= s.slot && si < s.slot + Math.ceil(sessionMins / 30))
                  const isAvailable = grid[di][si]
                  return (
                    <td key={di}
                      onMouseDown={() => onMouseDown(di, si)}
                      onMouseEnter={() => onMouseEnter(di, si)}
                      style={{
                        width: 36, height: 14, cursor: 'pointer',
                        background: isSuggested ? 'var(--accent)' : isAvailable ? 'rgba(167,139,250,.35)' : 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 2,
                        transition: 'background .1s',
                      }}
                    />
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Suggestion summary */}
      {hasSuggestion && (
        <div style={{ background: 'var(--accent-bg)', border: '1px solid rgba(167,139,250,.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
          <strong>Suggested times:</strong>
          <div style={{ marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {suggested.map((s, i) => {
              const slotInfo = SLOTS[s.slot]
              return (
                <span key={i} style={{ background: 'var(--accent)', color: '#fff', borderRadius: 99, padding: '2px 10px', fontSize: 12 }}>
                  {DAYS[s.day]} {slotInfo.label}
                </span>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={suggest}>
          💡 Suggest best times
        </button>
        {onBrainSuggest && (
          <button className="btn btn-ghost btn-sm" onClick={onBrainSuggest}>
            🧠 Ask Brain to suggest
          </button>
        )}
        <button className="btn btn-primary btn-sm" onClick={buildSlots} disabled={!grid.some(row => row.some(Boolean))}>
          Confirm schedule →
        </button>
      </div>
    </div>
  )
}
