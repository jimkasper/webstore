'use client'
import { useState, useEffect } from 'react'

type Step = 'info' | 'shipping' | 'payment' | 'complete'
type PaymentMethod = 'card' | 'paypal' | 'cashapp' | 'crypto'

interface CartItem { key: string; productId: string; variantId: string | null; name: string; price: number; quantity: number }
interface Rate { id: string; service: string; rate: number; deliveryDays?: number }
interface OrderInfo { firstName: string; lastName: string; email: string; address: string; city: string; state: string; zip: string; country: string }

const empty: OrderInfo = { firstName: '', lastName: '', email: '', address: '', city: '', state: '', zip: '', country: 'US' }

export default function CheckoutPage({ searchParams }: { searchParams: { ref?: string } }) {
  const [step, setStep] = useState<Step>('info')
  const [items, setItems] = useState<CartItem[]>([])
  const [info, setInfo] = useState<OrderInfo>(empty)
  const [rates, setRates] = useState<Rate[]>([])
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null)
  const [loadingRates, setLoadingRates] = useState(false)
  const [payMethod, setPayMethod] = useState<PaymentMethod>('card')
  const [discount, setDiscount] = useState('')
  const [discountValue, setDiscountValue] = useState(0)
  const [discountError, setDiscountError] = useState('')
  const [processing, setProcessing] = useState(false)

  const affiliateCode = searchParams.ref

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem('cart') ?? '[]'))
    if (affiliateCode) {
      fetch('/api/affiliates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: affiliateCode }) }).catch(() => {})
      localStorage.setItem('affiliateCode', affiliateCode)
    }
  }, [affiliateCode])

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const shippingCost = selectedRate?.rate ?? 0
  const total = Math.max(0, subtotal - discountValue) + shippingCost

  async function applyDiscount() {
    setDiscountError('')
    const res = await fetch(`/api/discounts/validate?code=${encodeURIComponent(discount)}&subtotal=${subtotal}`)
    if (res.ok) setDiscountValue((await res.json()).savings)
    else setDiscountError('Invalid or expired discount code.')
  }

  async function fetchRates() {
    setLoadingRates(true)
    const res = await fetch('/api/shipping/rates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toAddress: { name: `${info.firstName} ${info.lastName}`, street1: info.address, city: info.city, state: info.state, zip: info.zip, country: info.country } }) })
    if (res.ok) { const data = await res.json(); setRates(data); if (data.length > 0) setSelectedRate(data[0]) }
    setLoadingRates(false)
  }

  async function placeOrder(paymentRef: string) {
    const storedAffiliate = localStorage.getItem('affiliateCode')
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, customerEmail: info.email, customerName: `${info.firstName} ${info.lastName}`, shippingAddress: info, paymentMethod: payMethod, paymentRef, subtotal, tax: 0, shipping: shippingCost, total, discountCode: discount || null, affiliateCode: storedAffiliate || null }) })
    if (res.ok) { localStorage.removeItem('cart'); localStorage.removeItem('affiliateCode'); setStep('complete') }
  }

  async function handleStripeSubmit(e: React.FormEvent) {
    e.preventDefault(); setProcessing(true)
    const { clientSecret } = await (await fetch('/api/stripe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Math.round(total * 100), currency: 'usd' }) })).json()
    await placeOrder(clientSecret); setProcessing(false)
  }

  async function handleBTCPay() {
    setProcessing(true)
    const { checkoutLink } = await (await fetch('/api/btcpay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: total, currency: 'USD', orderId: `cart-${Date.now()}` }) })).json()
    window.location.href = checkoutLink
  }

  if (step === 'complete') return (
    <div style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-success)', marginBottom: '1rem' }}>Order Confirmed!</h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>A confirmation has been sent to {info.email}.</p>
      <a href="/" style={{ color: 'var(--color-accent)' }}>Continue shopping</a>
    </div>
  )

  const inp = { padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', width: '100%' }
  const lbl = { display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' } as const

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
      <div>
        {step === 'info' && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>Contact & Shipping</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {(['firstName','lastName'] as const).map(f => (<div key={f}><label style={lbl}>{f === 'firstName' ? 'First name' : 'Last name'}</label><input style={inp} value={info[f]} onChange={e => setInfo(i => ({...i, [f]: e.target.value}))} /></div>))}
            </div>
            <div style={{ marginTop: '0.75rem' }}><label style={lbl}>Email</label><input type="email" style={inp} value={info.email} onChange={e => setInfo(i => ({...i, email: e.target.value}))} /></div>
            <div style={{ marginTop: '0.75rem' }}><label style={lbl}>Address</label><input style={inp} value={info.address} onChange={e => setInfo(i => ({...i, address: e.target.value}))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
              {(['city','state','zip'] as const).map(f => (<div key={f}><label style={lbl}>{f[0].toUpperCase()+f.slice(1)}</label><input style={inp} value={info[f]} onChange={e => setInfo(i => ({...i, [f]: e.target.value}))} /></div>))}
            </div>
            <button onClick={() => { fetchRates(); setStep('shipping') }} style={{ marginTop: '1.5rem', padding: '0.875rem 2rem', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 }}>Continue to Shipping</button>
          </div>
        )}
        {step === 'shipping' && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>Shipping Method</h2>
            {loadingRates ? <p>Loading rates...</p> : rates.length === 0 ? <p style={{ color: 'var(--color-muted)' }}>No rates available.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {rates.map(r => (<label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '2px solid', borderColor: selectedRate?.id === r.id ? 'var(--color-accent)' : 'var(--color-border)', borderRadius: 'var(--radius)', cursor: 'pointer' }}><input type="radio" name="rate" checked={selectedRate?.id === r.id} onChange={() => setSelectedRate(r)} /><span style={{ flex: 1 }}>{r.service}{r.deliveryDays ? ` (${r.deliveryDays} days)` : ''}</span><span style={{ fontWeight: 700 }}>${r.rate.toFixed(2)}</span></label>))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setStep('info')} style={{ padding: '0.875rem 1.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', background: 'transparent' }}>Back</button>
              <button onClick={() => setStep('payment')} disabled={!selectedRate} style={{ padding: '0.875rem 2rem', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, opacity: selectedRate ? 1 : 0.5 }}>Continue to Payment</button>
            </div>
          </div>
        )}
        {step === 'payment' && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>Payment</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {([['card','Card / Apple Pay'],['paypal','PayPal / Venmo'],['cashapp','Cash App'],['crypto','Crypto']] as const).map(([id, label]) => (<button key={id} onClick={() => setPayMethod(id)} style={{ padding: '0.5rem 1rem', border: '2px solid', borderColor: payMethod === id ? 'var(--color-accent)' : 'var(--color-border)', borderRadius: 'var(--radius)', background: payMethod === id ? 'var(--color-accent)' : 'transparent', color: payMethod === id ? '#fff' : 'inherit', fontWeight: 600 }}>{label}</button>))}
            </div>
            {payMethod === 'card' && (<form onSubmit={handleStripeSubmit}><p style={{ color: 'var(--color-muted)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Stripe Secure Checkout</p><div id="stripe-elements" style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', marginBottom: '1rem', minHeight: 80, color: 'var(--color-muted)' }}>[Add STRIPE_PUBLISHABLE_KEY to enable Stripe Elements]</div><button type="submit" disabled={processing} style={{ width: '100%', padding: '0.875rem', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 }}>{processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}</button></form>)}
            {payMethod === 'paypal' && (<div><p style={{ color: 'var(--color-muted)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Pay with PayPal or Venmo</p><div id="paypal-button-container" style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', color: 'var(--color-muted)' }}>[Add PAYPAL_CLIENT_ID to enable PayPal Buttons]</div></div>)}
            {payMethod === 'cashapp' && (<div><p style={{ color: 'var(--color-muted)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Pay with Cash App Pay</p><div id="square-container" style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', color: 'var(--color-muted)' }}>[Add SQUARE_ACCESS_TOKEN to enable Cash App Pay]</div></div>)}
            {payMethod === 'crypto' && (<div><p style={{ color: 'var(--color-muted)', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Pay with BTC, ETH, SOL, XMR, USDC, or any coin on your BTCPay Server</p><button onClick={handleBTCPay} disabled={processing} style={{ width: '100%', padding: '0.875rem', background: '#f7931a', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600 }}>{processing ? 'Redirecting...' : `Pay with Crypto — $${total.toFixed(2)}`}</button></div>)}
            <button onClick={() => setStep('shipping')} style={{ marginTop: '1rem', color: 'var(--color-muted)', background: 'transparent', border: 'none', fontSize: '0.875rem' }}>← Back to shipping</button>
          </div>
        )}
      </div>
      <div style={{ padding: '1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius)', alignSelf: 'start' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h3>
        {items.map(i => (<div key={i.key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}><span>{i.name} ×{i.quantity}</span><span>${(i.price * i.quantity).toFixed(2)}</span></div>))}
        <hr style={{ margin: '1rem 0', borderColor: 'var(--color-border)' }} />
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input value={discount} onChange={e => setDiscount(e.target.value)} placeholder="Discount code" style={{ flex: 1, padding: '0.4rem 0.6rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }} />
          <button onClick={applyDiscount} style={{ padding: '0.4rem 0.75rem', background: 'var(--color-accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>Apply</button>
        </div>
        {discountError && <p style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{discountError}</p>}
        {discountValue > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontSize: '0.875rem', marginBottom: '0.5rem' }}><span>Discount</span><span>−${discountValue.toFixed(2)}</span></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}><span>Shipping</span><span>{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : '—'}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.125rem', marginTop: '0.75rem' }}><span>Total</span><span>${total.toFixed(2)}</span></div>
      </div>
    </div>
  )
}
