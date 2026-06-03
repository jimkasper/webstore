import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2025-02-24.acacia' })

export async function POST(req: NextRequest) {
  const { amount, currency } = await req.json()
  const paymentIntent = await stripe.paymentIntents.create({ amount, currency })
  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}

export async function PUT(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '')
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const { prisma } = await import('@/lib/prisma')
    if (pi.metadata?.orderId) {
      await prisma.order.update({ where: { id: pi.metadata.orderId }, data: { status: 'PAID' } })
    }
  }
  return NextResponse.json({ received: true })
}
