import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function OrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const orders = await prisma.order.findMany({
    where: searchParams.status ? { status: searchParams.status as any } : {},
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 200,
  })

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Orders</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['','PENDING','PAID','SHIPPED','FULFILLED','CANCELLED'].map(s => (
          <Link key={s} href={s ? `?status=${s}` : '/orders'} style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius)', fontSize: '0.8rem', background: searchParams.status === s || (!searchParams.status && !s) ? 'var(--color-accent)' : 'var(--color-surface)', color: searchParams.status === s || (!searchParams.status && !s) ? '#fff' : 'inherit', border: '1px solid var(--color-border)' }}>
            {s || 'All'}
          </Link>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface)', fontSize: '0.8rem', color: 'var(--color-muted)', textAlign: 'left' }}>
              {['Order','Customer','Method','Total','Status','Label','Date'].map(h => <th key={h} style={{ padding: '0.75rem 1rem' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderTop: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
                <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>#{o.id.slice(-8).toUpperCase()}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{o.customerEmail}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{o.paymentMethod}</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>${o.total.toFixed(2)}</td>
                <td style={{ padding: '0.75rem 1rem' }}><span style={{ padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', background: o.status === 'PAID' ? '#dcfce7' : '#f3f4f6', color: o.status === 'PAID' ? '#15803d' : '#374151' }}>{o.status}</span></td>
                <td style={{ padding: '0.75rem 1rem' }}>{o.shippingLabel ? <a href={o.shippingLabel} target="_blank" style={{ color: 'var(--color-accent)', fontSize: '0.8rem' }}>Print Label</a> : <span style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>—</span>}</td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
