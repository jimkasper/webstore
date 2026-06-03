import Link from 'next/link'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid var(--color-border)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: '1.25rem' }}>WebStore</Link>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/cart">Cart</Link>
          <Link href="/account">Account</Link>
        </nav>
      </header>
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '1.5rem 2rem', color: 'var(--color-muted)', textAlign: 'center', fontSize: '0.875rem' }}>
        &copy; {new Date().getFullYear()} WebStore
      </footer>
    </div>
  )
}
