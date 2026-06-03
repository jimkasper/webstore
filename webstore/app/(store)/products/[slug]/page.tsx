import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import AddToCart from '@/components/store/AddToCart'
import ReviewList from '@/components/store/ReviewList'

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { variants: true, category: true, reviews: { where: { approved: true }, orderBy: { createdAt: 'desc' } } },
  })
  if (!product || !product.active) notFound()

  const upsells = product.categoryId
    ? await prisma.product.findMany({
        where: { categoryId: product.categoryId, active: true, id: { not: product.id } },
        take: 4,
        include: { variants: true },
      })
    : []

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
        <div>
          {product.images.map((src, i) => (
            <img key={i} src={src} alt={product.name} style={{ width: '100%', borderRadius: 'var(--radius)', marginBottom: '0.5rem' }} />
          ))}
        </div>
        <div>
          {product.category && <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{product.category.name}</p>}
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>{product.name}</h1>
          {avgRating !== null && (
            <p style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }}>{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))} ({product.reviews.length})</p>
          )}
          <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>{product.description}</p>
          <AddToCart product={product} variants={product.variants} />
        </div>
      </div>
      <ReviewList reviews={product.reviews} productId={product.id} />
      {upsells.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>You might also like</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {upsells.map(p => {
              const price = p.variants.length > 0 ? Math.min(...p.variants.map(v => v.price)) : p.basePrice
              return (
                <a key={p.id} href={`/products/${p.slug}`} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'block' }}>
                  {p.images[0] && <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ color: 'var(--color-accent)' }}>${price.toFixed(2)}</div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
