import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function EmbedPage() {
  const products = await prisma.product.findMany({ where: { active: true }, include: { variants: true }, take: 24, orderBy: { createdAt: 'desc' } })

  return (
    <html lang="en">
      <head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
      <body style={{ margin: 0, fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem', padding: '1rem' }}>
          {products.map(p => {
            const price = p.variants.length > 0 ? Math.min(...p.variants.map(v => v.price)) : p.basePrice
            return (
              <Link key={p.id} href={`/products/${p.slug}`} target="_parent" style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', display: 'block', textDecoration: 'none', color: 'inherit' }}>
                {p.images[0] && <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: 150, objectFit: 'cover' }} />}
                <div style={{ padding: '0.6rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                  <div style={{ color: '#2563eb', fontWeight: 700, marginTop: '0.25rem' }}>${price.toFixed(2)}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </body>
    </html>
  )
}
