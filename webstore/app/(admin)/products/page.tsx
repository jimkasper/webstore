import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ include: { variants: true, category: true }, orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Products</h1>
        <Link href="/products/new" style={{ padding: '0.6rem 1.25rem', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600 }}>+ New Product</Link>
      </div>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface)', fontSize: '0.8rem', color: 'var(--color-muted)', textAlign: 'left' }}>
              {['Product','Type','Category','Variants','Price','Active'].map(h => <th key={h} style={{ padding: '0.75rem 1rem' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
                <td style={{ padding: '0.75rem 1rem' }}><Link href={`/products/${p.id}/edit`} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{p.name}</Link></td>
                <td style={{ padding: '0.75rem 1rem' }}>{p.type}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{p.category?.name ?? '—'}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{p.variants.length}</td>
                <td style={{ padding: '0.75rem 1rem' }}>${p.basePrice.toFixed(2)}</td>
                <td style={{ padding: '0.75rem 1rem' }}><span style={{ color: p.active ? 'var(--color-success)' : 'var(--color-error)' }}>{p.active ? 'Yes' : 'No'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
