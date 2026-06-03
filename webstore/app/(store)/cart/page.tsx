'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CartItem {
  key: string; productId: string; variantId: string | null
  name: string; price: number; quantity: number; image: string | null
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [email, setEmail] = useState('')

  useEffect(() => { setItems(JSON.parse(localStorage.getItem('cart') ?? '[]')) }, [])

  function update(key: string, qty: number) {
    const next = qty <= 0 ? items.filter(i => i.key !== key) : items.map(i => i.key === key ? { ...i, quantity: qty } : i)
    setItems(next)
    localStorage.setItem('cart', JSON.stringify(next))
  }

  async function saveEmail() {
    if (email) {
      await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, items }) })
    }
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  if (items.length === 0) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p style={{ marginBottom: '1rem', color: 'var(--color-muted)' }}>Your cart is empty.</p>
      <Link href="/" style={{ color: 'var(--color-accent)' }}>Continue shopping</Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Your Cart</h1>
      {items.map(item => (
        <div key={item.key} style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          {item.image && <img src={item.image} alt={item.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius)' }} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{item.name}</div>
            <div style={{ color: 'var(--color-muted)' }}>${item.price.toFixed(2)} each</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button onClick={() => update(item.key, item.quantity - 1)} style={{ width: 32, height: 32, border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', background: 'transparent' }}>−</button>
            <span>{item.quantity}</span>
            <button onClick={() => update(item.key, item.quantity + 1)} style={{ width: 32, height: 32, border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', background: 'transparent' }}>+</button>
          </div>
          <div style={{ fontWeight: 700, minWidth: 70, textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</div>
          <button onClick={() => update(item.key, 0)} style={{ color: 'var(--color-error)', background: 'transparent', border: 'none', fontSize: '1.25rem' }}>×</button>
        </div>
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 300, marginLeft: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.25rem' }}>
          <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
        </div>
        <input type="email" placeholder="Email (to save your cart)" value={email} onChange={e => setEmail(e.target.value)} onBlur={saveEmail}
          style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }} />
        <Link href="/checkout" style={{ display: 'block', padding: '0.875rem', background: 'var(--color-accent)', color: '#fff', textAlign: 'center', borderRadius: 'var(--radius)', fontWeight: 600 }}>Proceed to Checkout</Link>
        <Link href="/" style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.875rem' }}>Continue shopping</Link>
      </div>
    </div>
  )
}
