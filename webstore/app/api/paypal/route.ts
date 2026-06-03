import { NextRequest, NextResponse } from 'next/server'

const PAYPAL_BASE = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

export async function POST(req: NextRequest) {
  const { amount, currency = 'USD', orderId } = await req.json()
  const token = await getAccessToken()
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: currency, value: amount.toFixed(2) }, reference_id: orderId }],
    }),
  })
  const data = await res.json()
  return NextResponse.json({ id: data.id })
}

export async function PUT(req: NextRequest) {
  const { paypalOrderId, ourOrderId } = await req.json()
  const token = await getAccessToken()
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  if (!res.ok) return NextResponse.json({ error: 'Capture failed' }, { status: 400 })
  const { prisma } = await import('@/lib/prisma')
  await prisma.order.update({ where: { id: ourOrderId }, data: { status: 'PAID', paymentRef: paypalOrderId } })
  return NextResponse.json({ success: true })
}
