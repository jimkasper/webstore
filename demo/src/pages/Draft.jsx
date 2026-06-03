import { useState } from 'react'
import { useStore, getDraftOrder } from '../store.jsx'

const iStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13, width: '100%', boxSizing: 'border-box' }
const btnPrimary = { background: 'var(--accent)', color: '#0f172a', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }
const btnGhost = { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: 6, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }

export default function Draft() {
  const { data, addDraft, deleteDraft, makeDraftPick, undoDraftPick, addSpaceBlock } = useStore()
  const drafts = data.drafts || []
  const [selectedId, setSelectedId] = useState(drafts[0]?.id ?? null)
  const [showNew, setShowNew] = useState(false)
  const [toast, setToast] = useState(null)

  // New draft form state
  const [form, setForm] = useState({ title: '', topic: '' })
  const [formParties, setFormParties] = useState([])
  const [connPick, setConnPick] = useState('')
  const [namedInput, setNamedInput] = useState('')
  const [itemInput, setItemInput] = useState('')
  const [formItems, setFormItems] = useState([])
  const [rounds, setRounds] = useState(3)

  const draft = drafts.find(d => d.id === selectedId)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  function openNew() {
    setForm({ title: '', topic: '' })
    setFormParties([{ name: data.user.name, handle: data.user.handle, isUser: true }])
    setConnPick('')
    setNamedInput('')
    setItemInput('')
    setFormItems([])
    setRounds(3)
    setShowNew(true)
  }

  function addConnParty() {
    const conn = data.connections.find(c => c.handle === connPick)
    if (!conn) return
    if (formParties.some(p => p.handle === conn.handle)) return
    setFormParties(fp => [...fp, { name: conn.name, handle: conn.handle, isUser: false }])
    setConnPick('')
  }

  function addNamedParty() {
    const name = namedInput.trim()
    if (!name) return
    setFormParties(fp => [...fp, { name, handle: null, isUser: false }])
    setNamedInput('')
  }

  function addItem() {
    const text = itemInput.trim()
    if (!text || formItems.includes(text)) return
    setFormItems(fi => [...fi, text])
    setItemInput('')
  }

  function handleCreate() {
    if (!form.title.trim() || formParties.length < 2) return
    const id = addDraft({ title: form.title.trim(), topic: form.topic.trim(), parties: formParties, availableItems: formItems, rounds })
    setSelectedId(id)
    setShowNew(false)
  }

  function handleSimulate(draftId) {
    const d = drafts.find(x => x.id === draftId)
    if (!d || d.availableItems.length === 0) return
    const idx = Math.floor(Math.random() * d.availableItems.length)
    makeDraftPick(draftId, d.availableItems[idx])
  }

  function handleShareToSpace(d) {
    addSpaceBlock({ pageId: 'spage-wall', type: 'draft_results', label: d.title, props: { draftId: d.id, privacy: 'Public' } })
    showToast('✓ Draft board added to your SPACE Wall')
  }

  const usableConns = (data.connections || []).filter(c => !formParties.some(p => p.handle === c.handle))

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>🎲</span>
        <div className="topbar-title">Draft</div>
        <div className="topbar-sep" />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Snake draft rooms</span>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 240, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Drafts</span>
            <button onClick={openNew} style={{ ...btnPrimary, padding: '3px 10px', fontSize: 12 }}>+ New</button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {drafts.map(d => (
              <div key={d.id} onClick={() => { setSelectedId(d.id); setShowNew(false) }} style={{
                padding: '9px 12px', cursor: 'pointer',
                background: selectedId === d.id && !showNew ? 'var(--bg)' : 'transparent',
                borderLeft: `2px solid ${selectedId === d.id && !showNew ? 'var(--accent)' : 'transparent'}`,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
                  <span style={{
                    fontSize: 10, borderRadius: 4, padding: '1px 6px', fontWeight: 600,
                    background: d.status === 'completed' ? '#22c55e22' : '#f59e0b22',
                    color: d.status === 'completed' ? '#22c55e' : '#f59e0b',
                  }}>{d.status}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{d.parties.length} parties · {d.rounds}R</span>
                </div>
              </div>
            ))}
            {drafts.length === 0 && <div style={{ padding: 16, fontSize: 12, color: 'var(--text-3)' }}>No drafts yet.</div>}
          </div>
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)' }}>{drafts.length} drafts</div>
        </div>

        {/* Main area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* ---- New Draft Form ---- */}
          {showNew && (
            <div style={{ maxWidth: 600 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>🎲 New Draft</div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Best Albums of All Time" style={iStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Topic</label>
                  <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Music" style={iStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 8 }}>Parties (you are always first)</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {formParties.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: p.isUser ? 'var(--accent-bg)' : 'var(--surface)',
                      border: `1px solid ${p.isUser ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 20, padding: '3px 10px', fontSize: 12,
                    }}>
                      {p.isUser ? '👤' : p.handle ? '@' + p.handle : '🎲'} {p.name}
                      {!p.isUser && (
                        <button onClick={() => setFormParties(fp => fp.filter((_, j) => j !== i))}
                          style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12, padding: 0, marginLeft: 2 }}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <select value={connPick} onChange={e => setConnPick(e.target.value)}
                    style={{ ...iStyle, flex: 1, width: 'auto' }}>
                    <option value="">Add connection…</option>
                    {usableConns.map(c => <option key={c.handle} value={c.handle}>{c.name}</option>)}
                  </select>
                  <button onClick={addConnParty} disabled={!connPick} style={{ ...btnPrimary, opacity: connPick ? 1 : 0.5 }}>+ Add</button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={namedInput} onChange={e => setNamedInput(e.target.value)} placeholder="Or type a name…"
                    style={{ ...iStyle, flex: 1 }} onKeyDown={e => e.key === 'Enter' && addNamedParty()} />
                  <button onClick={addNamedParty} disabled={!namedInput.trim()} style={{ ...btnPrimary, opacity: namedInput.trim() ? 1 : 0.5 }}>+ Add</button>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 8 }}>Item Pool</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {formItems.map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 10px', fontSize: 12 }}>
                      {item}
                      <button onClick={() => setFormItems(fi => fi.filter(x => x !== item))}
                        style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12, padding: 0, marginLeft: 2 }}>✕</button>
                    </div>
                  ))}
                  {formItems.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>No items yet</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={itemInput} onChange={e => setItemInput(e.target.value)} placeholder="Add item to pool…"
                    style={{ ...iStyle, flex: 1 }} onKeyDown={e => e.key === 'Enter' && addItem()} />
                  <button onClick={addItem} disabled={!itemInput.trim()} style={{ ...btnPrimary, opacity: itemInput.trim() ? 1 : 0.5 }}>+ Add</button>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Rounds</label>
                <input type="number" min={1} max={20} value={rounds} onChange={e => setRounds(Number(e.target.value))}
                  style={{ ...iStyle, width: 80 }} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleCreate} disabled={!form.title.trim() || formParties.length < 2}
                  style={{ ...btnPrimary, opacity: form.title.trim() && formParties.length >= 2 ? 1 : 0.5 }}>
                  Start Draft →
                </button>
                <button onClick={() => setShowNew(false)} style={btnGhost}>Cancel</button>
              </div>
              {formParties.length < 2 && (
                <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>Add at least one more party to start the draft.</div>
              )}
            </div>
          )}

          {/* ---- Active Draft ---- */}
          {!showNew && draft && draft.status === 'in-progress' && (
            <ActiveDraft draft={draft} makeDraftPick={makeDraftPick} undoDraftPick={undoDraftPick} handleSimulate={handleSimulate} />
          )}

          {/* ---- Completed Draft ---- */}
          {!showNew && draft && draft.status === 'completed' && (
            <CompletedDraft draft={draft} deleteDraft={() => { deleteDraft(draft.id); setSelectedId(drafts.find(d => d.id !== draft.id)?.id ?? null) }} shareToSpace={() => handleShareToSpace(draft)} />
          )}

          {/* ---- Empty State ---- */}
          {!showNew && !draft && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'var(--text-3)', gap: 12 }}>
              <div style={{ fontSize: 48 }}>🎲</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)' }}>No drafts yet</div>
              <div style={{ fontSize: 13 }}>Create a draft room and pick items in snake order</div>
              <button onClick={openNew} style={btnPrimary}>Create Draft</button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', borderRadius: 8, padding: '10px 18px', fontSize: 13, zIndex: 300, boxShadow: '0 4px 16px rgba(0,0,0,.4)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

function ActiveDraft({ draft, makeDraftPick, undoDraftPick, handleSimulate }) {
  const order = getDraftOrder(draft.parties.length, draft.rounds)
  const totalPicks = order.length
  const donePicks = draft.picks.length
  const currentSlot = order[donePicks]
  const currentParty = currentSlot ? draft.parties[currentSlot.partyIndex] : null

  const rowStyle = { borderBottom: '1px solid var(--border)', padding: '10px 0' }

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{draft.title}</div>
          {draft.topic && <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{draft.topic}</div>}
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
            Round {currentSlot?.round ?? '—'} of {draft.rounds} · Pick {donePicks + 1} of {totalPicks}
          </div>
        </div>
        {donePicks > 0 && (
          <button onClick={() => undoDraftPick(draft.id)} style={{ ...btnGhost, fontSize: 12 }}>↩ Undo Last Pick</button>
        )}
      </div>

      {/* Current turn */}
      {currentParty && (
        <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '16px 20px', marginBottom: 20, border: '1px solid var(--border)' }}>
          {currentParty.isUser ? (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--accent)' }}>🎯 Your pick</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {draft.availableItems.map(item => (
                  <button key={item} onClick={() => makeDraftPick(draft.id, item)} style={{
                    background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)',
                    borderRadius: 20, padding: '5px 14px', fontSize: 13, cursor: 'pointer',
                    transition: 'border-color .15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-bg)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)' }}
                  >{item}</button>
                ))}
                {draft.availableItems.length === 0 && <span style={{ fontSize: 13, color: 'var(--text-3)' }}>No items left in pool.</span>}
              </div>
            </>
          ) : currentParty.handle ? (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: 'var(--text-2)' }}>⏳ {currentParty.name}'s pick</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12 }}>{currentParty.name} hasn't made their pick yet.</div>
              <button onClick={() => handleSimulate(draft.id)} style={btnPrimary}>Simulate {currentParty.name}'s pick</button>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--text-2)' }}>🎲 {currentParty.name}'s pick</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {draft.availableItems.map(item => (
                  <button key={item} onClick={() => makeDraftPick(draft.id, item)} style={{
                    background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)',
                    borderRadius: 20, padding: '5px 14px', fontSize: 13, cursor: 'pointer',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = 'var(--bg)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                  >{item}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Draft Board */}
      <DraftBoard draft={draft} order={order} />
    </div>
  )
}

function CompletedDraft({ draft, deleteDraft, shareToSpace }) {
  const order = getDraftOrder(draft.parties.length, draft.rounds)

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>🏆 {draft.title} — Final Results</div>
          {draft.topic && <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{draft.topic}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={shareToSpace} style={btnPrimary}>Share to SPACE</button>
          <button onClick={() => { if (window.confirm('Delete this draft?')) deleteDraft() }} style={{ ...btnGhost, color: '#e05c5c', borderColor: '#e05c5c' }}>Delete</button>
        </div>
      </div>
      <DraftBoard draft={draft} order={order} />
    </div>
  )
}

function DraftBoard({ draft, order }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 10 }}>── Draft Board</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--text-3)', fontWeight: 600, fontSize: 11, borderBottom: '1px solid var(--border)', width: 60 }}>Round</th>
              {draft.parties.map((p, i) => (
                <th key={i} style={{ padding: '6px 12px', textAlign: 'left', color: p.isUser ? 'var(--accent)' : 'var(--text-2)', fontWeight: 600, fontSize: 12, borderBottom: '1px solid var(--border)' }}>
                  {p.name}{p.isUser ? ' 👤' : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: draft.rounds }, (_, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 10px', color: 'var(--text-3)', fontSize: 12, fontWeight: 600 }}>R{ri + 1}</td>
                {draft.parties.map((_, pi) => {
                  const pick = draft.picks.find(p => p.round === ri + 1 && p.partyIndex === pi)
                  return (
                    <td key={pi} style={{ padding: '8px 12px', color: pick ? 'var(--text-1)' : 'var(--text-3)' }}>
                      {pick ? pick.item : <span style={{ opacity: 0.3 }}>—</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
