'use client'
import { useState } from 'react'

interface Review { id: string; reviewerEmail: string; rating: number; body: string; createdAt: Date }

export default function ReviewList({ reviews, productId }: { reviews: Review[]; productId: string }) {
  const [form, setForm] = useState({ email: '', rating: 5, body: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, productId }) })
    if (res.ok) setSubmitted(true)
    else setError('Could not submit review. Please verify your purchase email.')
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Reviews ({reviews.length})</h2>
      {reviews.map(r => (
        <div key={r.id} style={{ borderTop: '1px solid var(--color-border)', padding: '1rem 0' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{r.reviewerEmail.replace(/(.{2}).*@/, '$1***@')}</span>
          </div>
          <p>{r.body}</p>
        </div>
      ))}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius)' }}>
        <h3 style={{ marginBottom: '1rem' }}>Leave a Review</h3>
        {submitted ? (
          <p style={{ color: 'var(--color-success)' }}>Thank you! Your review is pending approval.</p>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input required type="email" placeholder="Your order email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }} />
            <select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))} style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }}>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} stars</option>)}
            </select>
            <textarea required rows={4} placeholder="Your review" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', resize: 'vertical' }} />
            {error && <p style={{ color: 'var(--color-error)' }}>{error}</p>}
            <button type="submit" style={{ padding: '0.625rem', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 }}>Submit Review</button>
          </form>
        )}
      </div>
    </div>
  )
}
