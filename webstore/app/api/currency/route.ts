import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const base = process.env.STORE_CURRENCY ?? 'USD'
  const target = req.nextUrl.searchParams.get('to') ?? 'USD'
  if (target === base) return NextResponse.json({ rate: 1 })
  const res = await fetch(`https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/pair/${base}/${target}`)
  if (!res.ok) return NextResponse.json({ rate: 1 })
  const data = await res.json()
  return NextResponse.json({ rate: data.conversion_rate })
}
