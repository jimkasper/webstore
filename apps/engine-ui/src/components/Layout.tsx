import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: 24, maxWidth: 960, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  )
}
