import { NextRequest, NextResponse } from 'next/server'
import { createInvoice, getInvoice } from '@/lib/btcpay'

export async function POST(req: NextRequest) {
  const { amount, currency, orderId } = await req.json()
  const invoice = await createInvoice(amount, currency, orderId)
  return NextResponse.json(invoice)
}

export async function GET(req: NextRequest) {
  const invoiceId = req.nextUrl.searchParams.get('id')
  if (!invoiceId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const status = await getInvoice(invoiceId)
  return NextResponse.json(status)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  if (body.type === 'InvoiceSettled') {
    const { prisma } = await import('@/lib/prisma')
    await prisma.order.updateMany({ where: { paymentRef: body.invoiceId }, data: { status: 'PAID' } })
  }
  return NextResponse.json({ received: true })
}
