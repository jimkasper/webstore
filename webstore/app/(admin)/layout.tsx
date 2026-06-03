import Link from 'next/link'

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/products', label: 'Products' },
  { href: '/orders', label: 'Orders' },
  { href: '/customers', label: 'Customers' },
  { href: '/discounts', label: 'Discounts' },
  { href: '/affiliates', label: 'Affiliates' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/settings', label: 'Settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#111', color: '#fff', padding: '1.5rem 0', flexShrink: 0 }}>
        <div style={{ padding: '0 1.25rem', fontWeight: 700, fontSize: '1.125rem', marginBottom: '1.5rem' }}>Admin</div>
        <nav>
          {nav.map(({ href, label }) => (
            <Link key={href} href={href} style={{ display: 'block', padding: '0.6rem 1.25rem', color: '#d1d5db', fontSize: '0.9rem' }}>{label}</Link>
          ))}
        </nav>
        <div style={{ padding: '1.25rem', borderTop: '1px solid #333', marginTop: '2rem' }}>
          <Link href="/" style={{ color: '#6b7280', fontSize: '0.875rem' }}>← View Store</Link>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '2rem', background: 'var(--color-surface)', minHeight: '100vh' }}>{children}</main>
    </div>
  )
}
