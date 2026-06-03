import { NextRequest, NextResponse } from 'next/server'

const SQUARE_BASE = process.env.SQUARE_ENVIRONMENT === 'production'
  ? 'https://connect.squareup.com'
  : 'https://connect.squareupsandbox.com'

export async function POST(req: NextRequest) {
  const { sourceId, amount, currency = 'USD', orderId } = await req.json()
  const res = await fetch(`${SQUARE_BASE}/v2/payments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_id: sourceId,
      idempotency_key: orderId,
      amount_money: { amount: Math.round(amount * 100), currency },
      location_id: process.env.SQUARE_LOCATION_ID,
    }),
  })
  const data = await res.json()
  if (data.payment?.status === 'COMPLETED') {
    const { prisma } = await import('@/lib/prisma')
    await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID', paymentRef: data.payment.id } })
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: data.errors }, { status: 400 })
}
