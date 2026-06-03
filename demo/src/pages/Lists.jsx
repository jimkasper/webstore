import { useState } from 'react'
import { useStore } from '../store.jsx'

const LIST_TYPES = ['Checklist', 'Shopping', 'Todo', 'Ranked', 'Notes', 'Tier', 'Household']

const HOUSEHOLD_CATEGORIES = ['Groceries', 'Supplies', 'Repair', 'Replace', 'Maintain', 'Wants', 'Needs']
const CATEGORY_COLOR = {
  Groceries: '#22c55e', Supplies: '#3b82f6', Repair: '#ef4444',
  Replace: '#f97316', Maintain: '#8b5cf6', Wants: '#ec4899', Needs: '#f59e0b',
}
const URGENCY_COLOR = {
  'Need Soon': '#ef4444', 'Eventually': '#f59e0b', 'Ongoing': '#3b82f6',
}

const HOUSEHOLD_TEMPLATE_ITEMS = [
  { text: 'Greek yogurt (×4)',     category: 'Groceries', urgency: 'Need Soon',  estCost: null, recurring: false, recurringPeriod: null },
  { text: 'Eggs (×12)',            category: 'Groceries', urgency: 'Need Soon',  estCost: null, recurring: false, recurringPeriod: null },
  { text: 'Whole grain bread',     category: 'Groceries', urgency: 'Need Soon',  estCost: null, recurring: false, recurringPeriod: null },
  { text: 'Paper towels',          category: 'Supplies',  urgency: 'Need Soon',  estCost: 8,    recurring: false, recurringPeriod: null },
  { text: 'Dish soap',             category: 'Supplies',  urgency: 'Need Soon',  estCost: 4,    recurring: false, recurringPeriod: null },
  { text: 'Laundry detergent',     category: 'Supplies',  urgency: 'Eventually', estCost: 14,   recurring: true,  recurringPeriod: 'monthly' },
  { text: 'Fix leaky faucet',      category: 'Repair',    urgency: 'Need Soon',  estCost: 150,  recurring: false, recurringPeriod: null },
  { text: 'Replace shower head',   category: 'Replace',   urgency: 'Eventually', estCost: 40,   recurring: false, recurringPeriod: null },
  { text: 'Change HVAC filter',    category: 'Maintain',  urgency: 'Ongoing',    estCost: 18,   recurring: true,  recurringPeriod: 'monthly' },
  { text: 'Clean gutters',         category: 'Maintain',  urgency: 'Ongoing',    estCost: 0,    recurring: true,  recurringPeriod: 'quarterly' },
  { text: 'New desk lamp',         category: 'Wants',     urgency: 'Eventually', estCost: 35,   recurring: false, recurringPeriod: null },
  { text: 'New mattress',          category: 'Needs',     urgency: 'Eventually', estCost: 800,  recurring: false, recurringPeriod: null },
]

const DEFAULT_TIERS = [
  { label: 'S', color: '#ef4444' },
  { label: 'A', color: '#f97316' },
  { label: 'B', color: '#eab308' },
  { label: 'C', color: '#22c55e' },
  { label: 'D', color: '#3b82f6' },
]
const EMOJIS = ['📚', '🛒', '🗺️', '🎬', '🏠', '💡', '🎯', '🎵', '✈️', '🍽️', '🧪', '📝']

const TRAVEL_ITEMS = [
  { text: 'Book flights',                   note: 'Pre-departure' },
  { text: 'Book accommodation',             note: 'Pre-departure' },
  { text: 'Get travel insurance',           note: 'Pre-departure' },
  { text: 'Notify bank of travel dates',    note: 'Pre-departure' },
  { text: 'Research destination',           note: 'Pre-departure' },
  { text: 'Passport',                       note: 'Documents' },
  { text: 'Visa (if required)',             note: 'Documents' },
  { text: 'Hotel confirmation',             note: 'Documents' },
  { text: 'Flight tickets saved/printed',   note: 'Documents' },
  { text: 'Running shoes',                  note: 'Packing' },
  { text: 'Camera',                         note: 'Packing' },
  { text: 'Rain jacket',                    note: 'Packing' },
  { text: 'Portable charger',               note: 'Packing' },
  { text: 'Universal adapter',              note: 'Packing' },
  { text: 'Medications',                    note: 'Packing' },
  { text: 'Local SIM or data plan',         note: 'On-trip' },
  { text: 'Exchange cash',                  note: 'On-trip' },
  { text: 'Emergency contacts saved',       note: 'On-trip' },
]

const TEMPLATES = [
  { id: 'blank',  label: '📝 Blank',  desc: 'Start with an empty list' },
  { id: 'travel', label: '✈️ Travel', desc: 'Pre-departure, docs, packing & on-trip checklist' },
]

const EMPTY_FORM = { name: '', emoji: '📝', type: 'Checklist', mode: 'quick', template: 'blank', description: '' }
const EMPTY_H_ITEM = { category: 'Groceries', urgency: 'Need Soon', estCost: '', recurring: false, recurringPeriod: null, assignedTo: null }

export default function Lists() {
  const { data, addList, updateList, deleteList, addListItem, toggleListItem, deleteListItem, updateListItem } = useStore()
  const [selected, setSelected] = useState(data.lists[0]?.id ?? null)
  const [showNew, setShowNew] = useState(false)
  const [step, setStep] = useState(1)    // 1=mode, 2=template, 3=details
  const [form, setForm] = useState(EMPTY_FORM)
  const [newItem, setNewItem] = useState('')
  const [newItemMeta, setNewItemMeta] = useState(EMPTY_H_ITEM)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState('')
  const [itemTierPicker, setItemTierPicker] = useState(null)
  const [hCatFilter, setHCatFilter] = useState('All')
  const [editingItemId, setEditingItemId] = useState(null)

  const list = data.lists.find(l => l.id === selected)
  const done = list ? list.items.filter(i => i.done).length : 0
  const total = list ? list.items.length : 0

  function openNew() { setForm(EMPTY_FORM); setStep(1); setShowNew(true) }
  function closeNew() { setShowNew(false); setStep(1) }

  function handleCreate() {
    if (!form.name.trim()) return
    let items = []
    let emoji = form.emoji
    let extra = {}
    if (form.mode === 'tier') {
      extra = { tiers: DEFAULT_TIERS }
    } else if (form.mode === 'master' && form.template === 'travel') {
      items = TRAVEL_ITEMS.map((item, i) => ({ id: `ti-${Date.now()}-${i}`, done: false, ...item }))
      emoji = '✈️'
    } else if (form.mode === 'household' && form.template === 'household') {
      items = HOUSEHOLD_TEMPLATE_ITEMS.map((item, i) => ({ id: `hli-${Date.now()}-${i}`, done: false, note: '', assignedTo: null, ...item }))
      emoji = '🏠'
    }
    const type = form.mode === 'tier' ? 'Tier' : form.mode === 'household' ? 'Household' : form.type
    const id = addList({ name: form.name.trim(), emoji, type, mode: form.mode, template: form.template, description: form.description.trim(), items, ...extra })
    setSelected(id)
    closeNew()
  }

  function handleAddItem(e) {
    e.preventDefault()
    if (!newItem.trim() || !list) return
    if (list.mode === 'tier') {
      addListItem(list.id, { text: newItem.trim(), tier: null })
    } else if (list.mode === 'household') {
      addListItem(list.id, {
        text: newItem.trim(),
        category: newItemMeta.category,
        urgency: newItemMeta.urgency,
        estCost: newItemMeta.estCost !== '' ? Number(newItemMeta.estCost) : null,
        recurring: newItemMeta.recurring,
        recurringPeriod: newItemMeta.recurring ? newItemMeta.recurringPeriod : null,
        assignedTo: null,
      })
      setNewItemMeta(EMPTY_H_ITEM)
    } else {
      addListItem(list.id, { text: newItem.trim() })
    }
    setNewItem('')
  }

  function startEditName() { setNameVal(list.name); setEditingName(true) }
  function saveEditName(e) { e.preventDefault(); if (nameVal.trim()) updateList(list.id, { name: nameVal.trim() }); setEditingName(false) }

  const iStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 8px', color: 'var(--text-1)', fontSize: 13, width: '100%', boxSizing: 'border-box' }

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>📋</span>
        <div className="topbar-title">Lists</div>
        <div className="topbar-sep" />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Quick &amp; master lists</span>
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{ width: 240, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Lists</span>
            <button onClick={openNew} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>+ New</button>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {data.lists.map(l => {
              const d = l.items.filter(i => i.done).length
              const t = l.items.length
              const isMaster = l.mode === 'master'
              const isTier = l.mode === 'tier'
              const isHousehold = l.mode === 'household'
              return (
                <div key={l.id} onClick={() => { setSelected(l.id); setHCatFilter('All'); setEditingItemId(null) }} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', cursor: 'pointer',
                  background: selected === l.id ? 'var(--bg)' : 'transparent',
                  borderLeft: `2px solid ${selected === l.id ? 'var(--accent)' : 'transparent'}`,
                }}>
                  <span style={{ fontSize: 18 }}>{l.emoji}</span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', gap: 4, alignItems: 'center' }}>
                      {isTier ? `Tier · ${t} items` : isHousehold ? `Household · ${t - d} pending` : t === 0 ? 'Empty' : `${d}/${t} done`}
                      {isMaster && <span style={{ background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: 4, padding: '0 4px', fontSize: 10 }}>master</span>}
                      {isTier && <span style={{ background: '#7c3aed22', color: '#a78bfa', borderRadius: 4, padding: '0 4px', fontSize: 10 }}>tier</span>}
                      {isHousehold && <span style={{ background: '#f59e0b22', color: '#f59e0b', borderRadius: 4, padding: '0 4px', fontSize: 10 }}>household</span>}
                    </div>
                  </div>
                </div>
              )
            })}
            {data.lists.length === 0 && <div style={{ padding: 16, fontSize: 12, color: 'var(--text-3)' }}>No lists yet.</div>}
          </div>
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>{data.lists.length} lists</div>
        </div>

        {/* Detail */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {list ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>{list.emoji}</span>
                <div style={{ flex: 1 }}>
                  {editingName ? (
                    <form onSubmit={saveEditName} style={{ display: 'flex', gap: 6 }}>
                      <input autoFocus value={nameVal} onChange={e => setNameVal(e.target.value)}
                        style={{ background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: 4, padding: '4px 8px', color: 'var(--text-1)', fontSize: 18, fontWeight: 700 }} />
                      <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Save</button>
                      <button type="button" onClick={() => setEditingName(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
                    </form>
                  ) : (
                    <div style={{ fontSize: 20, fontWeight: 700, cursor: 'pointer' }} onClick={startEditName} title="Click to rename">{list.name}</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{list.type} · {done}/{total} done</span>
                    {list.mode === 'master' && (
                      <span style={{ fontSize: 11, background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: 4, padding: '1px 6px' }}>
                        ⭐ Master{list.template === 'travel' ? ' · Travel' : ''}
                      </span>
                    )}
                  </div>
                  {list.description && <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{list.description}</div>}
                </div>
                <button onClick={() => { deleteList(list.id); setSelected(data.lists.find(l => l.id !== list.id)?.id ?? null) }}
                  style={{ background: 'none', border: '1px solid #e05c5c', borderRadius: 4, padding: '4px 12px', fontSize: 12, color: '#e05c5c', cursor: 'pointer', flexShrink: 0 }}>Delete</button>
              </div>

              {list.mode !== 'tier' && list.mode !== 'household' && total > 0 && (
                <div style={{ background: 'var(--bg)', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 20 }}>
                  <div style={{ width: `${(done / total) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 4, transition: 'width .3s' }} />
                </div>
              )}

              {list.mode === 'household' ? (
                <HouseholdView
                  list={list}
                  hCatFilter={hCatFilter} setHCatFilter={setHCatFilter}
                  editingItemId={editingItemId} setEditingItemId={setEditingItemId}
                  toggleListItem={toggleListItem} deleteListItem={deleteListItem} updateListItem={updateListItem}
                  newItem={newItem} setNewItem={setNewItem}
                  newItemMeta={newItemMeta} setNewItemMeta={setNewItemMeta}
                  handleAddItem={handleAddItem}
                />
              ) : list.mode === 'tier' ? (
                <>
                  <TierBoard list={list} listId={list.id}
                    updateListItem={updateListItem} deleteListItem={deleteListItem}
                    itemTierPicker={itemTierPicker} setItemTierPicker={setItemTierPicker} />
                  <form onSubmit={handleAddItem} style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add item to Unranked…"
                      style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '7px 10px', color: 'var(--text-1)', fontSize: 13 }} />
                    <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '7px 16px', fontSize: 13, cursor: 'pointer' }}>Add</button>
                  </form>
                </>
              ) : list.template === 'travel' && total > 0 ? (
                <>
                  {(() => {
                    const groups = {}
                    list.items.forEach(item => { const g = item.note || 'Other'; if (!groups[g]) groups[g] = []; groups[g].push(item) })
                    return Object.entries(groups).map(([group, items]) => (
                      <div key={group} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 6 }}>{group}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {items.map(item => <ListItem key={item.id} item={item} listId={list.id} toggleListItem={toggleListItem} deleteListItem={deleteListItem} />)}
                        </div>
                      </div>
                    ))
                  })()}
                  <form onSubmit={handleAddItem} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add item…"
                      style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '7px 10px', color: 'var(--text-1)', fontSize: 13 }} />
                    <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '7px 16px', fontSize: 13, cursor: 'pointer' }}>Add</button>
                  </form>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
                    {list.items.map(item => <ListItem key={item.id} item={item} listId={list.id} toggleListItem={toggleListItem} deleteListItem={deleteListItem} />)}
                    {list.items.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '12px 0' }}>No items yet. Add one below.</div>}
                  </div>
                  <form onSubmit={handleAddItem} style={{ display: 'flex', gap: 8 }}>
                    <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add item…"
                      style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '7px 10px', color: 'var(--text-1)', fontSize: 13 }} />
                    <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '7px 16px', fontSize: 13, cursor: 'pointer' }}>Add</button>
                  </form>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'var(--text-3)', gap: 10 }}>
              <div style={{ fontSize: 36 }}>📋</div>
              <div style={{ fontSize: 13 }}>Select a list or create a new one</div>
              <button onClick={openNew} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontSize: 13, cursor: 'pointer' }}>+ New List</button>
            </div>
          )}
        </div>
      </div>

      {/* New list modal */}
      {showNew && (
        <div onClick={closeNew} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 28, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,.4)' }}>

            {step === 1 && (
              <>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>New List — Choose type</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { mode: 'quick',     icon: '⚡', label: 'Quick list',      desc: 'Simple checklist — add items and check them off' },
                    { mode: 'master',    icon: '⭐', label: 'Master list',     desc: 'Rich list with description, template support & progress tracking' },
                    { mode: 'tier',      icon: '🏆', label: 'Tier list',       desc: 'Rank items into tiers (S/A/B/C/D or custom)' },
                    { mode: 'household', icon: '🏠', label: 'Household Needs', desc: 'Track home essentials by category — groceries, repairs, supplies & more' },
                  ].map(opt => (
                    <div key={opt.mode} onClick={() => {
                      setForm(f => ({ ...f, mode: opt.mode, type: opt.mode === 'tier' ? 'Tier' : opt.mode === 'household' ? 'Household' : f.type, emoji: opt.mode === 'household' ? '🏠' : f.emoji }))
                      setStep(opt.mode === 'master' || opt.mode === 'household' ? 2 : 3)
                    }}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <span style={{ fontSize: 24 }}>{opt.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{opt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={closeNew} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 14px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
                </div>
              </>
            )}

            {step === 2 && form.mode === 'master' && (
              <>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Master List — Choose template</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>Templates pre-populate your list with useful starting items.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {TEMPLATES.map(t => (
                    <div key={t.id} onClick={() => { setForm(f => ({ ...f, template: t.id, emoji: t.id === 'travel' ? '✈️' : f.emoji })); setStep(3) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <span style={{ fontSize: 28 }}>{t.label.split(' ')[0]}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{t.label.split(' ').slice(1).join(' ')}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--text-3)', cursor: 'pointer', padding: 0 }}>← Back</button>
              </>
            )}

            {step === 2 && form.mode === 'household' && (
              <>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>🏠 Household Needs — Choose template</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>Start with a pre-filled list or build from scratch.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    { id: 'household', icon: '🏠', label: 'Household Needs', desc: `Pre-populated with ${HOUSEHOLD_TEMPLATE_ITEMS.length} items across Groceries, Supplies, Repair, Maintain, Wants & Needs` },
                    { id: 'blank',     icon: '📝', label: 'Blank Household',  desc: 'Start with an empty household list and add your own items' },
                  ].map(t => (
                    <div key={t.id} onClick={() => { setForm(f => ({ ...f, template: t.id })); setStep(3) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <span style={{ fontSize: 28 }}>{t.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{t.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--text-3)', cursor: 'pointer', padding: 0 }}>← Back</button>
              </>
            )}

            {step === 3 && (
              <>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
                  {form.mode === 'master' ? '⭐ Master List' : form.mode === 'tier' ? '🏆 Tier List' : form.mode === 'household' ? '🏠 Household Needs' : '⚡ Quick List'} — Details
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <select value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 4px', fontSize: 18, width: 50 }}>
                    {EMOJIS.map(em => <option key={em}>{em}</option>)}
                  </select>
                  <input autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="List name *"
                    style={{ ...iStyle, flex: 1 }}
                    onKeyDown={e => e.key === 'Enter' && form.name.trim() && handleCreate()} />
                </div>
                {form.mode !== 'tier' && form.mode !== 'household' && (
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    style={{ ...iStyle, marginBottom: 12 }}>
                    {LIST_TYPES.filter(t => t !== 'Tier' && t !== 'Household').map(t => <option key={t}>{t}</option>)}
                  </select>
                )}
                {form.mode === 'master' && (
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)"
                    rows={2} style={{ ...iStyle, resize: 'vertical', fontFamily: 'inherit', marginBottom: 12 }} />
                )}
                {form.mode === 'tier' && (
                  <div style={{ fontSize: 12, color: 'var(--text-3)', background: 'var(--bg)', borderRadius: 4, padding: '8px 12px', marginBottom: 12 }}>
                    🏆 Items start Unranked — assign tiers (S/A/B/C/D) after creation.
                  </div>
                )}
                {form.mode === 'master' && form.template === 'travel' && (
                  <div style={{ fontSize: 12, color: 'var(--text-3)', background: 'var(--bg)', borderRadius: 4, padding: '8px 12px', marginBottom: 12 }}>
                    ✈️ Travel template: pre-populates {TRAVEL_ITEMS.length} items across Pre-departure, Documents, Packing, and On-trip sections.
                  </div>
                )}
                {form.mode === 'household' && form.template === 'household' && (
                  <div style={{ fontSize: 12, color: 'var(--text-3)', background: '#f59e0b11', border: '1px solid #f59e0b33', borderRadius: 4, padding: '8px 12px', marginBottom: 12 }}>
                    🏠 Household Needs template: pre-populates {HOUSEHOLD_TEMPLATE_ITEMS.length} items across Groceries, Supplies, Repair, Replace, Maintain, Wants & Needs.
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={handleCreate} disabled={!form.name.trim()}
                    style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '8px', fontSize: 13, cursor: 'pointer', opacity: form.name.trim() ? 1 : 0.5 }}>
                    Create List
                  </button>
                  <button onClick={() => setStep(form.mode === 'master' || form.mode === 'household' ? 2 : 1)}
                    style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 14px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>
                    Back
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  )
}

// ─── Household components ─────────────────────────────────────────────────────

function HouseholdView({ list, hCatFilter, setHCatFilter, editingItemId, setEditingItemId, toggleListItem, deleteListItem, updateListItem, newItem, setNewItem, newItemMeta, setNewItemMeta, handleAddItem }) {
  const cats = ['All', ...HOUSEHOLD_CATEGORIES]
  const filteredItems = hCatFilter === 'All' ? list.items : list.items.filter(i => i.category === hCatFilter)
  const totalCost = list.items.filter(i => !i.done && i.estCost != null).reduce((s, i) => s + i.estCost, 0)

  return (
    <div>
      {/* Category filter tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {cats.map(cat => {
          const count = cat === 'All' ? list.items.filter(i => !i.done).length : list.items.filter(i => i.category === cat && !i.done).length
          const isActive = hCatFilter === cat
          const color = CATEGORY_COLOR[cat]
          return (
            <button key={cat} onClick={() => setHCatFilter(cat)}
              style={{
                padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: isActive ? (color ?? 'var(--accent)') : 'var(--surface)',
                color: isActive ? '#fff' : 'var(--text-2)',
                outline: isActive ? 'none' : '1px solid var(--border)',
              }}>
              {cat}{count > 0 ? ` (${count})` : ''}
            </button>
          )
        })}
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
        {filteredItems.map(item => (
          <HouseholdItem key={item.id} item={item} listId={list.id}
            isEditing={editingItemId === item.id}
            onEdit={() => setEditingItemId(editingItemId === item.id ? null : item.id)}
            toggleListItem={toggleListItem} deleteListItem={deleteListItem} updateListItem={updateListItem} />
        ))}
        {filteredItems.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '12px 0' }}>No items in this category.</div>
        )}
      </div>

      {/* Add item form */}
      <form onSubmit={handleAddItem} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add item…"
            style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '7px 10px', color: 'var(--text-1)', fontSize: 13 }} />
          <button type="submit" disabled={!newItem.trim()}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '7px 16px', fontSize: 13, cursor: 'pointer', opacity: newItem.trim() ? 1 : 0.5 }}>
            Add
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <select value={newItemMeta.category} onChange={e => setNewItemMeta(m => ({ ...m, category: e.target.value }))}
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--text-1)' }}>
            {HOUSEHOLD_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={newItemMeta.urgency} onChange={e => setNewItemMeta(m => ({ ...m, urgency: e.target.value }))}
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--text-1)' }}>
            {['Need Soon', 'Eventually', 'Ongoing'].map(u => <option key={u}>{u}</option>)}
          </select>
          <input type="number" min="0" placeholder="$ cost" value={newItemMeta.estCost}
            onChange={e => setNewItemMeta(m => ({ ...m, estCost: e.target.value }))}
            style={{ width: 80, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--text-1)' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
            <input type="checkbox" checked={newItemMeta.recurring} onChange={e => setNewItemMeta(m => ({ ...m, recurring: e.target.checked }))} />
            Recurring
          </label>
          {newItemMeta.recurring && (
            <select value={newItemMeta.recurringPeriod ?? 'monthly'} onChange={e => setNewItemMeta(m => ({ ...m, recurringPeriod: e.target.value }))}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--text-1)' }}>
              {['weekly', 'monthly', 'quarterly'].map(p => <option key={p}>{p}</option>)}
            </select>
          )}
        </div>
      </form>

      {/* Budget summary */}
      {totalCost > 0 && (
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <span>Estimated total (pending):</span>
          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>${totalCost.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
        </div>
      )}
    </div>
  )
}

function HouseholdItem({ item, listId, isEditing, onEdit, toggleListItem, deleteListItem, updateListItem }) {
  const [draft, setDraft] = useState({ category: item.category ?? 'Groceries', urgency: item.urgency ?? 'Need Soon', estCost: item.estCost ?? '', recurring: item.recurring ?? false, recurringPeriod: item.recurringPeriod ?? null, note: item.note ?? '' })

  function save() {
    updateListItem(listId, item.id, { ...draft, estCost: draft.estCost !== '' ? Number(draft.estCost) : null, recurringPeriod: draft.recurring ? (draft.recurringPeriod ?? 'monthly') : null })
    onEdit()
  }

  const catColor = CATEGORY_COLOR[item.category] ?? 'var(--text-3)'
  const urgColor = URGENCY_COLOR[item.urgency] ?? 'var(--text-3)'

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer' }} onClick={onEdit}>
        <input type="checkbox" checked={item.done} onChange={e => { e.stopPropagation(); toggleListItem(listId, item.id) }}
          style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--accent)', flexShrink: 0 }} onClick={e => e.stopPropagation()} />
        <span style={{ flex: 1, fontSize: 13, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--text-3)' : 'var(--text-1)' }}>{item.text}</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
          {item.category && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 99, background: `${catColor}22`, color: catColor }}>{item.category}</span>
          )}
          {item.urgency && (
            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: `${urgColor}18`, color: urgColor }}>{item.urgency}</span>
          )}
          {item.estCost != null && item.estCost > 0 && (
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>${item.estCost}</span>
          )}
          {item.recurring && <span title={`Recurring ${item.recurringPeriod ?? ''}`} style={{ fontSize: 12 }}>🔁</span>}
        </div>
        <button onClick={e => { e.stopPropagation(); deleteListItem(listId, item.id) }}
          style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1, flexShrink: 0 }}>✕</button>
      </div>

      {isEditing && (
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <select value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--text-1)' }}>
              {HOUSEHOLD_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={draft.urgency} onChange={e => setDraft(d => ({ ...d, urgency: e.target.value }))}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--text-1)' }}>
              {['Need Soon', 'Eventually', 'Ongoing'].map(u => <option key={u}>{u}</option>)}
            </select>
            <input type="number" min="0" placeholder="$ cost" value={draft.estCost}
              onChange={e => setDraft(d => ({ ...d, estCost: e.target.value }))}
              style={{ width: 80, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--text-1)' }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={draft.recurring} onChange={e => setDraft(d => ({ ...d, recurring: e.target.checked }))} />
              Recurring
            </label>
            {draft.recurring && (
              <select value={draft.recurringPeriod ?? 'monthly'} onChange={e => setDraft(d => ({ ...d, recurringPeriod: e.target.value }))}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--text-1)' }}>
                {['weekly', 'monthly', 'quarterly'].map(p => <option key={p}>{p}</option>)}
              </select>
            )}
          </div>
          <input value={draft.note} onChange={e => setDraft(d => ({ ...d, note: e.target.value }))} placeholder="Note (optional)"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--text-1)', width: '100%', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={save} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>Save</button>
            <button onClick={onEdit} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ListItem({ item, listId, toggleListItem, deleteListItem }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--surface)', borderRadius: 4 }}>
      <input type="checkbox" checked={item.done} onChange={() => toggleListItem(listId, item.id)}
        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent)', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--text-3)' : 'var(--text-1)' }}>{item.text}</span>
      {item.note && <span style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic', flexShrink: 0 }}>{item.note}</span>}
      <button onClick={() => deleteListItem(listId, item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 15, padding: 0, lineHeight: 1, flexShrink: 0 }}>✕</button>
    </div>
  )
}

function TierBoard({ list, listId, updateListItem, deleteListItem, itemTierPicker, setItemTierPicker }) {
  const tiers = list.tiers || DEFAULT_TIERS
  const allTierRows = [...tiers, { label: null, color: '#64748b' }]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
      {allTierRows.map(tier => {
        const tierItems = tier.label === null
          ? list.items.filter(i => i.tier === null || i.tier === undefined)
          : list.items.filter(i => i.tier === tier.label)
        const bg = tier.label ? `${tier.color}0f` : 'var(--bg)'
        return (
          <div key={tier.label ?? 'unranked'} style={{
            borderLeft: `4px solid ${tier.color}`,
            background: bg,
            borderRadius: '0 6px 6px 0',
            padding: '8px 10px',
            minHeight: 44,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontWeight: 800, fontSize: 13, color: tier.label ? tier.color : '#64748b',
                background: tier.label ? `${tier.color}22` : '#64748b22',
                borderRadius: 4, padding: '2px 8px', flexShrink: 0, minWidth: 28, textAlign: 'center',
              }}>
                {tier.label ?? 'Unranked'}
              </span>
              {tierItems.map(item => (
                <div key={item.id} style={{ position: 'relative' }}>
                  <div
                    onClick={() => setItemTierPicker(itemTierPicker === item.id ? null : item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 20, padding: '3px 8px 3px 10px',
                      fontSize: 12, cursor: 'pointer', userSelect: 'none',
                    }}
                  >
                    <span>{item.text}</span>
                    <button
                      onClick={e => { e.stopPropagation(); deleteListItem(listId, item.id) }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1, marginLeft: 2 }}
                    >✕</button>
                  </div>
                  {itemTierPicker === item.id && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: 8, display: 'flex', gap: 4, flexWrap: 'wrap',
                      boxShadow: '0 4px 16px rgba(0,0,0,.3)', minWidth: 180,
                    }} onClick={e => e.stopPropagation()}>
                      {tiers.map(t => (
                        <button key={t.label} onClick={() => { updateListItem(listId, item.id, { tier: t.label }); setItemTierPicker(null) }}
                          style={{ background: `${t.color}22`, border: `1px solid ${t.color}`, color: t.color, borderRadius: 4, padding: '3px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          {t.label}
                        </button>
                      ))}
                      <button onClick={() => { updateListItem(listId, item.id, { tier: null }); setItemTierPicker(null) }}
                        style={{ background: '#64748b22', border: '1px solid #64748b', color: '#64748b', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>
                        Unranked
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {tierItems.length === 0 && (
                <span style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>
                  {tier.label === null ? 'Drop items here or click a chip to assign a tier' : 'No items'}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
