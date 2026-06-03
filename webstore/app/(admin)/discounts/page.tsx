import { prisma } from '@/lib/prisma'

export default async function DiscountsPage() {
  const discounts = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Discount Codes</h1>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface)', fontSize: '0.8rem', color: 'var(--color-muted)', textAlign: 'left' }}>
              {['Code','Type','Value','Used','Limit','Expires','Active'].map(h => <th key={h} style={{ padding: '0.75rem 1rem' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {discounts.map(d => (
              <tr key={d.id} style={{ borderTop: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
                <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 600 }}>{d.code}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{d.type}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{d.type === 'FLAT' ? `$${d.value}` : `${d.value}%`}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{d.usageCount}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{d.usageLimit ?? '∞'}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : '—'}</td>
                <td style={{ padding: '0.75rem 1rem' }}><span style={{ color: d.active ? 'var(--color-success)' : 'var(--color-error)' }}>{d.active ? 'Yes' : 'No'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
