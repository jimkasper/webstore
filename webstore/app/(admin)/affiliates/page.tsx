import { prisma } from '@/lib/prisma'

export default async function AffiliatesPage() {
  const affiliates = await prisma.affiliate.findMany({ include: { _count: { select: { clicks: true, orders: true } } }, orderBy: { earnings: 'desc' } })
  const base = process.env.STORE_BASE_URL ?? 'http://localhost:3000'

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Affiliates</h1>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-surface)', fontSize: '0.8rem', color: 'var(--color-muted)', textAlign: 'left' }}>
              {['Email','Code','Commission','Earnings','Clicks','Orders','Link'].map(h => <th key={h} style={{ padding: '0.75rem 1rem' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {affiliates.map(a => (
              <tr key={a.id} style={{ borderTop: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
                <td style={{ padding: '0.75rem 1rem' }}>{a.email}</td>
                <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>{a.code}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{a.commissionPct}%</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>${a.earnings.toFixed(2)}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{a._count.clicks}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{a._count.orders}</td>
                <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-muted)' }}>{base}/?ref={a.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
