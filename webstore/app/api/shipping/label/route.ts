import { NextRequest, NextResponse } from 'next/server'
import { createLabel } from '@/lib/shipping'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { rateId, orderId } = await req.json()
  const label = await createLabel(rateId)
  await prisma.order.update({ where: { id: orderId }, data: { shippingLabel: label.labelUrl, status: 'SHIPPED' } })
  return NextResponse.json(label)
}
