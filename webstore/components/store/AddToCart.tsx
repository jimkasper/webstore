'use client'
import { useState } from 'react'
import type { Product, ProductVariant } from '@prisma/client'

interface Props { product: Product; variants: ProductVariant[] }

export default function AddToCart({ product, variants }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(variants[0] ?? null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const price = selectedVariant ? selectedVariant.price : product.basePrice
  const inStock = selectedVariant ? selectedVariant.stock > 0 : true

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem('cart') ?? '[]')
    const key = selectedVariant ? selectedVariant.id : product.id
    const existing = cart.find((i: any) => i.key === key)
    if (existing) {
      existing.quantity += qty
    } else {
      cart.push({ key, productId: product.id, variantId: selectedVariant?.id ?? null, name: product.name + (selectedVariant ? ` — ${selectedVariant.name}` : ''), price, quantity: qty, image: product.images[0] ?? null })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      {variants.length > 1 && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select option</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {variants.map(v => (
              <button key={v.id} onClick={() => setSelectedVariant(v)}
                style={{ padding: '0.4rem 0.8rem', border: '2px solid', borderColor: selectedVariant?.id === v.id ? 'var(--color-accent)' : 'var(--color-border)', borderRadius: 'var(--radius)', background: selectedVariant?.id === v.id ? 'var(--color-accent)' : 'transparent', color: selectedVariant?.id === v.id ? '#fff' : 'inherit', opacity: v.stock === 0 ? 0.4 : 1 }}>
                {v.name} {v.stock === 0 ? '(sold out)' : ''}
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '1rem' }}>${price.toFixed(2)}</div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
        <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', background: 'transparent', fontSize: '1.25rem' }}>−</button>
        <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{qty}</span>
        <button onClick={() => setQty(q => q + 1)} style={{ width: 36, height: 36, border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', background: 'transparent', fontSize: '1.25rem' }}>+</button>
      </div>
      <button onClick={addToCart} disabled={!inStock}
        style={{ width: '100%', padding: '0.875rem', background: inStock ? 'var(--color-accent)' : 'var(--color-border)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: '1rem', fontWeight: 600 }}>
        {added ? 'Added!' : inStock ? 'Add to Cart' : 'Sold Out'}
      </button>
    </div>
  )
}
