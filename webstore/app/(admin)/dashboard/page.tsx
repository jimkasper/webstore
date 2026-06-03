import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const [orderCount, revenue, productCount, customerCount, recentOrders] = await Promise.all([
    prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { total: true } }),
    prisma.product.count({ where: { active: true } }),
    prisma.customer.count(),
    prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { items: true } }),
  ])

  const statCard = (label: string, value: string) => (
    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
      <div style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</div>
    </div>
  )

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {statCard('Total Revenue', `$${(revenue._sum.total ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`)}
        {statCard('Orders', orderCount.toString())}
        {statCard('Active Products', productCount.toString())}
        {statCard('Customers', customerCount.toString())}
      </div>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', fontWeight: 600 }}>Recent Orders</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface)', fontSize: '0.8rem', color: 'var(--color-muted)', textAlign: 'left' }}>
              {['Order','Customer','Items','Total','Status','Date'].map(h => <th key={h} style={{ padding: '0.75rem 1rem' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(o => (
              <tr key={o.id} style={{ borderTop: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
                <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>#{o.id.slice(-8).toUpperCase()}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{o.customerEmail}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{o.items.length}</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>${o.total.toFixed(2)}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', background: o.status === 'PAID' ? '#dcfce7' : o.status === 'SHIPPED' ? '#dbeafe' : '#f3f4f6', color: o.status === 'PAID' ? '#15803d' : o.status === 'SHIPPED' ? '#1d4ed8' : '#374151' }}>{o.status}</span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--color-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
