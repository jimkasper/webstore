import { prisma } from '@/lib/prisma'

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ include: { _count: { select: { orders: true } } }, orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Customers</h1>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface)', fontSize: '0.8rem', color: 'var(--color-muted)', textAlign: 'left' }}>
              {['Email','Name','Orders','Joined'].map(h => <th key={h} style={{ padding: '0.75rem 1rem' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
                <td style={{ padding: '0.75rem 1rem' }}>{c.email}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{c.name ?? '—'}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{c._count.orders}</td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
