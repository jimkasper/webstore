import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { email, items } = await req.json()
  await prisma.cartSession.upsert({
    where: { id: email },
    update: { email, items },
    create: { id: email, email, items },
  })
  return NextResponse.json({ ok: true })
}
