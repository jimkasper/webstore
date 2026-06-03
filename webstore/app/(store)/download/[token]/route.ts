import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const token = await prisma.downloadToken.findUnique({ where: { token: params.token }, include: { variant: true } })
  if (!token) return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
  if (token.expiresAt < new Date()) return NextResponse.json({ error: 'Link expired' }, { status: 410 })
  if (token.usesRemaining <= 0) return NextResponse.json({ error: 'Download limit reached' }, { status: 410 })
  await prisma.downloadToken.update({ where: { id: token.id }, data: { usesRemaining: { decrement: 1 } } })
  return NextResponse.json({ ok: true, variantId: token.variantId, usesLeft: token.usesRemaining - 1 })
}
