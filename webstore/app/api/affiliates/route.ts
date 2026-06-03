import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  const affiliate = await prisma.affiliate.findUnique({ where: { code } })
  if (!affiliate || !affiliate.active) return NextResponse.json({ error: 'Invalid code' }, { status: 404 })
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined
  await prisma.affiliateClick.create({ data: { affiliateId: affiliate.id, ip } })
  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  const affiliate = await prisma.affiliate.findUnique({ where: { code }, include: { clicks: true, orders: { select: { total: true } } } })
  if (!affiliate) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(affiliate)
}
