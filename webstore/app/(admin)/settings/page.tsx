export default function SettingsPage() {
  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Settings</h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: '2rem' }}>Configure your store via environment variables in <code>.env</code>. Restart the server after changes.</p>
      {[
        { title: 'Payment Providers', vars: ['STRIPE_SECRET_KEY','STRIPE_PUBLISHABLE_KEY','STRIPE_WEBHOOK_SECRET','PAYPAL_CLIENT_ID','PAYPAL_CLIENT_SECRET','PAYPAL_MODE','SQUARE_ACCESS_TOKEN','SQUARE_LOCATION_ID','SQUARE_ENVIRONMENT','BTCPAY_URL','BTCPAY_API_KEY','BTCPAY_STORE_ID'] },
        { title: 'Email', vars: ['EMAIL_PROVIDER (resend | sendgrid | smtp)','RESEND_API_KEY','SENDGRID_API_KEY','SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','EMAIL_FROM'] },
        { title: 'Shipping', vars: ['SHIPPING_PROVIDER (easypost | shippo | shipstation)','EASYPOST_API_KEY','SHIPPO_API_KEY','SHIPSTATION_API_KEY','SHIPSTATION_API_SECRET'] },
        { title: 'Store', vars: ['STORE_BASE_URL','STORE_CURRENCY','ADMIN_EMAIL','INVENTORY_ALERT_THRESHOLD','EXCHANGE_RATE_API_KEY'] },
      ].map(section => (
        <div key={section.title} style={{ background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>{section.title}</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {section.vars.map(v => <li key={v}><code style={{ fontSize: '0.85rem', background: 'var(--color-surface)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>{v}</code></li>)}
          </ul>
        </div>
      ))}
    </div>
  )
}
