import { useState, useMemo } from 'react'
import { useStore } from '../store.jsx'

const CATEGORIES = ['All', 'Food', 'Coffee', 'Bars', 'Fitness', 'Parks', 'Books', 'Shopping']
const PLACE_CATS = ['Food', 'Coffee', 'Bars', 'Fitness', 'Parks', 'Books', 'Shopping']
const TABS = ['Explore', 'Saved', 'Check-ins']

const inputSt = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', color: 'var(--text-1)', fontSize: 13 }

function PlaceModal({ place, onSave, onClose }) {
  const [form, setForm] = useState({
    name: place?.name || '',
    category: place?.category || 'Food',
    address: place?.address || '',
    rating: place?.rating ?? 3,
    note: place?.note || '',
    tags: (place?.tags || []).join(', '),
  })
  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }
  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      name: form.name.trim(),
      category: form.category,
      address: form.address.trim(),
      rating: parseInt(form.rating),
      note: form.note.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    onClose()
  }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{place ? 'Edit Place' : 'Add Place'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: 'var(--text-2)', gridColumn: '1/-1' }}>
            Name *
            <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Lighthouse Coffee" style={inputSt} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: 'var(--text-2)' }}>
            Category
            <select value={form.category} onChange={e => set('category', e.target.value)} style={inputSt}>
              {PLACE_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: 'var(--text-2)' }}>
            Rating
            <select value={form.rating} onChange={e => set('rating', e.target.value)} style={inputSt}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: 'var(--text-2)', gridColumn: '1/-1' }}>
            Address
            <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street, City" style={inputSt} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: 'var(--text-2)', gridColumn: '1/-1' }}>
            Tags <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(comma-separated)</span>
            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Cozy, Local, Outdoor" style={inputSt} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: 'var(--text-2)', gridColumn: '1/-1' }}>
            Note
            <textarea value={form.note} onChange={e => set('note', e.target.value)} rows={2} placeholder="What makes it special?" style={{ ...inputSt, resize: 'vertical' }} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontSize: 13, cursor: 'pointer' }}>
            {place ? 'Save Changes' : 'Add Place'}
          </button>
          <button type="button" onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 12px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

function Stars({ n }) {
  return <span style={{ color: '#e0a040', fontSize: 12 }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
}

function PlaceCard({ place, saved, onSave, onCheckin, onEdit, onDelete, contacts }) {
  const [expanded, setExpanded] = useState(false)
  const friends = (place.friendsFrequent || []).map(id => contacts.find(c => c.id === id)).filter(Boolean)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{place.name}</span>
              <span style={{ fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '1px 7px', color: 'var(--text-3)' }}>{place.category}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Stars n={place.rating} />
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{place.address}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 8 }}>
            <button
              onClick={e => { e.stopPropagation(); onSave(place.id) }}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 12, cursor: 'pointer', color: saved ? 'var(--accent)' : 'var(--text-3)' }}
              title={saved ? 'Unsave' : 'Save'}
            >{saved ? '★ Saved' : '☆ Save'}</button>
            <button
              onClick={e => { e.stopPropagation(); onCheckin(place) }}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 12, cursor: 'pointer' }}
            >Check in</button>
            {onEdit && (
              <button onClick={e => { e.stopPropagation(); onEdit(place) }}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 6px', fontSize: 12, cursor: 'pointer', color: 'var(--text-3)' }} title="Edit">✎</button>
            )}
            {onDelete && (
              <button onClick={e => { e.stopPropagation(); if (window.confirm(`Delete "${place.name}"?`)) onDelete(place.id) }}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 6px', fontSize: 12, cursor: 'pointer', color: '#e05c5c' }} title="Delete">✕</button>
            )}
          </div>
        </div>
        {friends.length > 0 && (
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-2)' }}>
            👫 {friends.map(f => f.name).join(', ')} frequent here
          </div>
        )}
      </div>
      {expanded && (
        <div style={{ padding: '0 14px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ paddingTop: 10, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 8 }}>{place.note}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {place.tags.map(t => (
              <span key={t} style={{ fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '2px 8px', color: 'var(--text-3)' }}>{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AroundTown() {
  const { data, toggleSavedPlace, addCheckin, deleteCheckin, addPlace, updatePlace, deletePlace } = useStore()
  const [tab, setTab] = useState('Explore')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [checkinPlace, setCheckinPlace] = useState(null)
  const [checkinNote, setCheckinNote] = useState('')
  const [placeModal, setPlaceModal] = useState(null) // null | 'new' | place-object

  const filtered = useMemo(() => {
    let list = [...data.places]
    if (category !== 'All') list = list.filter(p => p.category === category)
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
    return list
  }, [data.places, category, search])

  const savedPlaces = useMemo(() =>
    data.places.filter(p => data.savedPlaces.includes(p.id)),
    [data.places, data.savedPlaces])

  const checkinsFull = useMemo(() =>
    [...data.checkins]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(ci => ({ ...ci, place: data.places.find(p => p.id === ci.placeId) })),
    [data.checkins, data.places])

  function submitCheckin(e) {
    e.preventDefault()
    addCheckin({ placeId: checkinPlace.id, note: checkinNote })
    setCheckinPlace(null)
    setCheckinNote('')
  }

  return (
    <div className="content">
      <div className="topbar">
        <span style={{ fontSize: 18 }}>📍</span>
        <div className="topbar-title">Around Town</div>
        <div className="topbar-sep" />
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Places you love, friends you might run into</span>
      </div>
      <div className="scroll"><div className="pad">

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent', padding: '6px 14px', marginBottom: -1, color: tab === t ? 'var(--accent)' : 'var(--text-2)', fontWeight: tab === t ? 600 : 400, fontSize: 13, cursor: 'pointer' }}>
            {t}{t === 'Saved' ? ` (${data.savedPlaces.length})` : t === 'Check-ins' ? ` (${data.checkins.length})` : ''}
          </button>
        ))}
      </div>

      {/* Place modal */}
      {placeModal && (
        <PlaceModal
          place={placeModal === 'new' ? null : placeModal}
          onSave={placeModal === 'new' ? addPlace : patch => updatePlace(placeModal.id, patch)}
          onClose={() => setPlaceModal(null)}
        />
      )}

      {/* Check-in modal */}
      {checkinPlace && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => e.target === e.currentTarget && setCheckinPlace(null)}>
          <form onSubmit={submitCheckin} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, width: '100%', maxWidth: 420 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Check in to {checkinPlace.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>{checkinPlace.address}</div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-2)', marginBottom: 14 }}>
              Note (optional)
              <textarea value={checkinNote} onChange={e => setCheckinNote(e.target.value)} rows={3} placeholder="What did you do / eat / think?"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 10px', color: 'var(--text-1)', fontSize: 13, resize: 'vertical' }} />
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontSize: 13, cursor: 'pointer' }}>Check in</button>
              <button type="button" onClick={() => setCheckinPlace(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 12px', fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Explore */}
      {tab === 'Explore' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search places…"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', color: 'var(--text-1)', fontSize: 13, width: 200 }} />
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  style={{ background: category === c ? 'var(--accent)' : 'var(--bg)', color: category === c ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>
                  {c}
                </button>
              ))}
            </div>
            <button onClick={() => setPlaceModal('new')}
              style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>
              + Add Place
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '20px 0' }}>No places found.</div>}
            {filtered.map(p => (
              <PlaceCard key={p.id} place={p} saved={data.savedPlaces.includes(p.id)}
                onSave={toggleSavedPlace} onCheckin={setCheckinPlace} contacts={data.contacts}
                onEdit={setPlaceModal} onDelete={deletePlace} />
            ))}
          </div>
        </div>
      )}

      {/* Saved */}
      {tab === 'Saved' && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>{savedPlaces.length} saved place{savedPlaces.length !== 1 ? 's' : ''}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {savedPlaces.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '20px 0' }}>No saved places yet. Star a place in Explore to save it.</div>}
            {savedPlaces.map(p => (
              <PlaceCard key={p.id} place={p} saved contacts={data.contacts}
                onSave={toggleSavedPlace} onCheckin={setCheckinPlace}
                onEdit={setPlaceModal} onDelete={deletePlace} />
            ))}
          </div>
        </div>
      )}

      {/* Check-ins */}
      {tab === 'Check-ins' && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>{checkinsFull.length} check-ins logged</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 32px', gap: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>
              <span>DATE</span><span>PLACE</span><span>NOTE</span><span></span>
            </div>
            {checkinsFull.map(ci => (
              <div key={ci.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 32px', gap: 8, padding: '8px 12px', background: 'var(--surface)', borderRadius: 4, fontSize: 13, alignItems: 'center' }}>
                <span style={{ color: 'var(--text-3)' }}>{ci.date}</span>
                <span style={{ fontWeight: 600 }}>{ci.place?.name ?? '—'}</span>
                <span style={{ color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ci.note || '—'}</span>
                <button onClick={() => deleteCheckin(ci.id)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 15, padding: 0, lineHeight: 1 }}>✕</button>
              </div>
            ))}
            {checkinsFull.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '20px 0' }}>No check-ins yet. Hit "Check in" on any place.</div>}
          </div>
        </div>
      )}
      </div></div>
    </div>
  )
}
