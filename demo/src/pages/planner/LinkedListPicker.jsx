const TYPE_ICON = { Shopping: '🛒', Checklist: '✅', Todo: '☑️', Household: '🏠', Notes: '📝', Ranked: '🏆' }

export default function LinkedListPicker({ lists = [], selectedIds = [], onChange, label = 'Required lists' }) {
  const selectable = lists.filter(l => l.type !== 'Tier' && l.mode !== 'tier')
  if (!selectable.length) return null

  function toggle(id) {
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id])
  }

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {selectable.map(l => {
          const undone = (l.items || []).filter(i => !i.done).length
          const total = (l.items || []).length
          const sel = selectedIds.includes(l.id)
          return (
            <button key={l.id} onClick={() => toggle(l.id)} type="button"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 10, fontSize: 12, cursor: 'pointer',
                border: `1px solid ${sel ? 'var(--accent)' : 'var(--border)'}`,
                background: sel ? 'var(--accent-bg)' : 'var(--bg)',
                color: sel ? 'var(--accent)' : 'var(--text-2)',
              }}>
              <span>{l.emoji || TYPE_ICON[l.type] || '📋'}</span>
              <span>{l.name}</span>
              {total > 0 && (
                <span style={{ fontSize: 10, opacity: 0.75 }}>
                  {undone}/{total}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {selectedIds.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {selectedIds.map(id => {
            const list = selectable.find(l => l.id === id)
            if (!list) return null
            const undoneItems = (list.items || []).filter(i => !i.done)
            if (!undoneItems.length) return null
            return (
              <div key={id} style={{ fontSize: 11, color: 'var(--text-3)', paddingLeft: 4 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{list.emoji} {list.name}:</span>
                {' '}{undoneItems.slice(0, 3).map(i => i.text).join(', ')}
                {undoneItems.length > 3 ? ` +${undoneItems.length - 3} more` : ''}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
