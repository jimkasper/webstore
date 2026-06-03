import { prisma } from '@/lib/prisma'

export default async function AccountPage({ searchParams }: { searchParams: { email?: string } }) {
  if (!searchParams.email) return (
    <div style={{ maxWidth: 400, margin: '4rem auto' }}>
      <h1 style={{ fontWeight: 700, marginBottom: '1rem' }}>My Account</h1>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input name="email" type="email" placeholder="Your order email" style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }} />
        <button type="submit" style={{ padding: '0.625rem', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 }}>View Orders</button>
      </form>
    </div>
  )

  const orders = await prisma.order.findMany({
    where: { customerEmail: searchParams.email },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { downloads: true } } },
  })

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontWeight: 700, fontSize: '1.75rem', marginBottom: '1.5rem' }}>Order History</h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>{searchParams.email}</p>
      {orders.length === 0 ? <p style={{ color: 'var(--color-muted)' }}>No orders found.</p> : orders.map(o => (
        <div key={o.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', marginBottom: '1rem', overflow: 'hidden' }}>
          <div style={{ background: 'var(--color-surface)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ fontFamily: 'monospace' }}>#{o.id.slice(-8).toUpperCase()}</span>
            <span>{new Date(o.createdAt).toLocaleDateString()}</span>
            <span style={{ fontWeight: 700 }}>${o.total.toFixed(2)}</span>
            <span style={{ color: o.status === 'PAID' ? 'var(--color-success)' : 'var(--color-muted)' }}>{o.status}</span>
          </div>
          {o.items.map(item => (
            <div key={item.id} style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span>{item.name} ×{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
              {item.downloads.length > 0 && item.downloads[0].usesRemaining > 0 && item.downloads[0].expiresAt > new Date() && (
                <a href={`/download/${item.downloads[0].token}`} style={{ color: 'var(--color-accent)' }}>Download</a>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
