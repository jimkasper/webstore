import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') ?? ''
  const subtotal = parseFloat(req.nextUrl.searchParams.get('subtotal') ?? '0')
  const discount = await prisma.discountCode.findUnique({ where: { code } })
  if (!discount || !discount.active) return NextResponse.json({ error: 'Invalid code' }, { status: 404 })
  if (discount.expiresAt && discount.expiresAt < new Date()) return NextResponse.json({ error: 'Expired' }, { status: 410 })
  if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) return NextResponse.json({ error: 'Limit reached' }, { status: 410 })
  const savings = discount.type === 'FLAT' ? discount.value : (subtotal * discount.value) / 100
  return NextResponse.json({ savings: Math.min(savings, subtotal) })
}
