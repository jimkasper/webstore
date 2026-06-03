import { prisma } from '@/lib/prisma'

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({ include: { product: { select: { name: true } } }, orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Reviews</h1>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface)', fontSize: '0.8rem', color: 'var(--color-muted)', textAlign: 'left' }}>
              {['Product','Email','Rating','Review','Status','Date'].map(h => <th key={h} style={{ padding: '0.75rem 1rem' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id} style={{ borderTop: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{r.product.name}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{r.reviewerEmail}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{'★'.repeat(r.rating)}</td>
                <td style={{ padding: '0.75rem 1rem', maxWidth: 300 }}>{r.body}</td>
                <td style={{ padding: '0.75rem 1rem' }}><span style={{ color: r.approved ? 'var(--color-success)' : 'var(--color-muted)' }}>{r.approved ? 'Approved' : 'Pending'}</span></td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
