import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

const bg      = '#060c18'
const surface = '#1e293b'
const surface2= '#0f172a'
const border  = '1px solid #334155'
const accent  = '#84cc16'
const text1   = '#f1f5f9'
const text2   = '#94a3b8'
const text3   = '#64748b'

const CATEGORIES = [
  { id: 'all',       label: 'All',              icon: '⊞' },
  { id: 'featured',  label: 'Featured',         icon: '⭐' },
  { id: 'algorithm', label: 'Algorithms',       icon: '⚡' },
  { id: 'theme',     label: 'Themes',           icon: '🎨' },
  { id: 'block',     label: 'Blocks',           icon: '⬜' },
  { id: 'trigger',   label: 'Trigger Presets',  icon: '⚙' },
  { id: 'digital',   label: 'Digital Products', icon: '📦' },
]

const TYPE_COLORS = {
  algorithm: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', label: 'Algorithm' },
  theme:     { bg: 'rgba(251,146,60,0.15)',  color: '#fb923c', label: 'Theme' },
  block:     { bg: 'rgba(132,204,22,0.15)', color: '#84cc16', label: 'Block' },
  trigger:   { bg: 'rgba(244,114,182,0.15)', color: '#f472b6', label: 'Trigger' },
  digital:   { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa', label: 'Digital' },
}

const BADGE_COLORS = {
  'Popular':   { bg: '#fbbf24', color: '#0f172a' },
  'Top Rated': { bg: '#84cc16', color: '#0f172a' },
  'New':       { bg: '#818cf8', color: '#fff' },
}

function Stars({ rating }) {
  return (
    <span style={{ fontSize: 11, color: '#fbbf24' }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      <span style={{ color: text3, marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </span>
  )
}

function ListingCard({ listing, onSelect, selected }) {
  const tc = TYPE_COLORS[listing.type] || TYPE_COLORS.block
  const bc = BADGE_COLORS[listing.badge]
  return (
    <div
      onClick={() => onSelect(listing)}
      style={{
        background: selected ? '#1a2540' : surface,
        border: `1px solid ${selected ? accent : '#334155'}`,
        borderRadius: 10, padding: '16px 14px', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 10,
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
            {listing.type === 'algorithm' ? '⚡' : listing.type === 'theme' ? '🎨' : listing.type === 'block' ? '⬜' : listing.type === 'trigger' ? '⚙' : '📦'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: text1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.name}</div>
            <div style={{ fontSize: 11, color: text3 }}>by {listing.author.name}</div>
          </div>
        </div>
        {listing.badge && bc && (
          <span style={{ fontSize: 9, fontWeight: 700, background: bc.bg, color: bc.color, borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {listing.badge}
          </span>
        )}
      </div>

      <p style={{ fontSize: 12, color: text2, margin: 0, lineHeight: 1.5,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {listing.description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, background: tc.bg, color: tc.color, borderRadius: 4, padding: '2px 7px' }}>{tc.label}</span>
          {listing.tags.slice(0, 2).map(t => (
            <span key={t} style={{ fontSize: 10, background: '#0f172a', color: text3, border, borderRadius: 4, padding: '2px 7px' }}>{t}</span>
          ))}
        </div>
        <Stars rating={listing.rating} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: text3 }}>{listing.installs.toLocaleString()} installs</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: listing.priceCredits === 0 ? '#4ade80' : accent }}>
          {listing.priceLabel}
        </span>
      </div>

      {listing.installed && (
        <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>✓ Installed</div>
      )}
    </div>
  )
}

function DetailPanel({ listing, onClose, onInstall, onPurchase, userCredits }) {
  const tc = TYPE_COLORS[listing.type] || TYPE_COLORS.block
  const canAfford = listing.priceCredits === 0 || userCredits >= listing.priceCredits
  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, width: 380, height: '100vh',
      background: '#0d1929', borderLeft: border, zIndex: 100,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: text1 }}>Listing Detail</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: text2, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
            {listing.type === 'algorithm' ? '⚡' : listing.type === 'theme' ? '🎨' : listing.type === 'block' ? '⬜' : listing.type === 'trigger' ? '⚙' : '📦'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: text1, marginBottom: 2 }}>{listing.name}</div>
            <div style={{ fontSize: 12, color: text3, marginBottom: 6 }}>by {listing.author.name} · @{listing.author.handle}</div>
            <Stars rating={listing.rating} />
            <span style={{ fontSize: 11, color: text3, marginLeft: 6 }}>({listing.ratingCount} ratings)</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, background: tc.bg, color: tc.color, borderRadius: 4, padding: '3px 8px' }}>{tc.label}</span>
          {listing.tags.map(t => (
            <span key={t} style={{ fontSize: 11, background: '#0f172a', color: text3, border, borderRadius: 4, padding: '3px 8px' }}>{t}</span>
          ))}
        </div>

        <p style={{ fontSize: 13, color: text2, lineHeight: 1.7, marginBottom: 20 }}>{listing.description}</p>

        <div style={{ background: surface2, borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: text3 }}>Price</span>
            <span style={{ color: listing.priceCredits === 0 ? '#4ade80' : text1, fontWeight: 700 }}>{listing.priceLabel}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: text3 }}>Installs</span>
            <span style={{ color: text1 }}>{listing.installs.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: text3 }}>Your credits</span>
            <span style={{ color: canAfford ? text1 : '#ef4444' }}>{userCredits} cr</span>
          </div>
        </div>

        {listing.installed ? (
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, color: '#4ade80', fontWeight: 700, fontSize: 14 }}>
            ✓ Installed
          </div>
        ) : listing.priceCredits === 0 ? (
          <button onClick={onInstall} style={{ width: '100%', background: accent, color: '#0f172a', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Install Free
          </button>
        ) : canAfford ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={onPurchase} style={{ width: '100%', background: accent, color: '#0f172a', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Buy for {listing.priceCredits} credits
            </button>
            <div style={{ fontSize: 11, color: text3, textAlign: 'center' }}>Credits are non-refundable after purchase</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontSize: 13 }}>
            Not enough credits ({listing.priceCredits - userCredits} more needed)
          </div>
        )}

        <div style={{ marginTop: 24, borderTop: border, paddingTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: text3, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reviews</div>
          {[
            { author: 'Priya S.', rating: 5, text: 'Exactly what I needed. Works flawlessly with the rest of the platform.' },
            { author: 'Marcus W.', rating: 4, text: 'Solid. Would love more configuration options but does the job well.' },
          ].map((r, i) => (
            <div key={i} style={{ marginBottom: 12, padding: '10px 12px', background: surface2, borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: text1 }}>{r.author}</span>
                <Stars rating={r.rating} />
              </div>
              <p style={{ fontSize: 12, color: text2, margin: 0, lineHeight: 1.5 }}>{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TradingPost() {
  const nav = useNavigate()
  const { data, installTradingListing, purchaseTradingListing } = useStore()
  const listings = data.tradingListings || []
  const userCredits = data.user?.credits || 0

  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')
  const [selectedListing, setSelectedListing] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (category === 'featured') return !!l.badge
      if (category !== 'all' && l.type !== category) return false
      if (priceFilter === 'free' && l.priceCredits !== 0) return false
      if (priceFilter === 'paid' && l.priceCredits === 0) return false
      if (search && !l.name.toLowerCase().includes(search.toLowerCase()) &&
          !l.description.toLowerCase().includes(search.toLowerCase()) &&
          !l.tags.some(t => t.includes(search.toLowerCase()))) return false
      return true
    })
  }, [listings, category, search, priceFilter])

  const counts = useMemo(() => {
    const c = { all: listings.length, featured: listings.filter(l => l.badge).length }
    CATEGORIES.forEach(cat => { if (cat.id !== 'all' && cat.id !== 'featured') c[cat.id] = listings.filter(l => l.type === cat.id).length })
    return c
  }, [listings])

  function handleInstall(listing) {
    installTradingListing(listing.id)
    setSelectedListing({ ...listing, installed: true })
    showToast(`✓ ${listing.name} installed`)
  }

  function handlePurchase(listing) {
    purchaseTradingListing(listing.id)
    setSelectedListing({ ...listing, installed: true })
    showToast(`✓ ${listing.name} purchased and installed`)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: bg, color: text1, fontFamily: 'system-ui,sans-serif', overflow: 'hidden' }}>
      {/* Top nav */}
      <div style={{ height: 48, background: '#0a1628', borderBottom: border, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0, zIndex: 10 }}>
        <button onClick={() => nav('/')} style={{ background: 'none', border: 'none', color: text2, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>← Home</button>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['⊞ AUTOGENES', '/autogenes'], ['⬡ MONOGENES', '/monogenes'], ['⬣ AGORA', '/agora'], ['⊞ DASH', '/dash']].map(([l, p]) => (
            <button key={p} onClick={() => nav(p)} style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer', fontSize: 12 }}>{l}</button>
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '0.05em', color: accent }}>⬥ TRADING POST</div>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search listings…"
          style={{ width: 220, background: surface, border, borderRadius: 6, padding: '5px 10px', color: text1, fontSize: 12, outline: 'none' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: text2, whiteSpace: 'nowrap' }}>
          <span style={{ background: 'rgba(132,204,22,0.15)', color: accent, borderRadius: 12, padding: '2px 10px', fontWeight: 700 }}>
            {userCredits} cr
          </span>
          <span>@{data.user?.handle}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{ width: 200, borderRight: border, padding: '16px 12px', flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Categories</div>
          {CATEGORIES.map(cat => (
            <div
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 10px', borderRadius: 6, cursor: 'pointer', marginBottom: 2,
                background: category === cat.id ? 'rgba(132,204,22,0.12)' : 'transparent',
                color: category === cat.id ? accent : text2,
                fontWeight: category === cat.id ? 600 : 400, fontSize: 13,
              }}
            >
              <span>{cat.icon} {cat.label}</span>
              <span style={{ fontSize: 11, color: text3 }}>{counts[cat.id] ?? 0}</span>
            </div>
          ))}

          <div style={{ marginTop: 20, borderTop: border, paddingTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Price</div>
            {[['all','All'], ['free','Free'], ['paid','Credits']].map(([v, l]) => (
              <div key={v} onClick={() => setPriceFilter(v)} style={{
                padding: '7px 10px', borderRadius: 6, cursor: 'pointer', marginBottom: 2, fontSize: 13,
                background: priceFilter === v ? 'rgba(132,204,22,0.12)' : 'transparent',
                color: priceFilter === v ? accent : text2, fontWeight: priceFilter === v ? 600 : 400,
              }}>{l}</div>
            ))}
          </div>

          <div style={{ marginTop: 20, borderTop: border, paddingTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Installed</div>
            <div style={{ fontSize: 13, color: accent, fontWeight: 600 }}>
              {listings.filter(l => l.installed).length} / {listings.length}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', marginRight: selectedListing ? 380 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: text1 }}>
                {CATEGORIES.find(c => c.id === category)?.label || 'All'} Listings
              </h2>
              <div style={{ fontSize: 12, color: text3, marginTop: 2 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => nav('/dash')} style={{ background: 'none', border, color: text2, borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>⊞ DASH</button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: text3 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No listings found</div>
              <div style={{ fontSize: 13 }}>Try a different category or search term</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {filtered.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  selected={selectedListing?.id === listing.id}
                  onSelect={setSelectedListing}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedListing && (
        <DetailPanel
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onInstall={() => handleInstall(selectedListing)}
          onPurchase={() => handlePurchase(selectedListing)}
          userCredits={userCredits}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', border: '1px solid #84cc16', color: '#84cc16', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
