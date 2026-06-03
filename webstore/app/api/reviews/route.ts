import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { productId, email, rating, body } = await req.json()
  const order = await prisma.order.findFirst({
    where: { customerEmail: email, items: { some: { productId } }, status: { in: ['PAID','SHIPPED','FULFILLED'] } },
  })
  if (!order) return NextResponse.json({ error: 'No verified purchase found.' }, { status: 403 })
  await prisma.review.create({ data: { productId, reviewerEmail: email, rating: Math.min(5, Math.max(1, rating)), body, approved: false } })
  return NextResponse.json({ ok: true })
}
