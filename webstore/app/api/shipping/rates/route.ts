import { NextRequest, NextResponse } from 'next/server'
import { getRates } from '@/lib/shipping'

const FROM_ADDRESS = {
  name: 'WebStore Fulfillment',
  street1: process.env.STORE_FROM_ADDRESS_STREET ?? '123 Main St',
  city: process.env.STORE_FROM_ADDRESS_CITY ?? 'Chicago',
  state: process.env.STORE_FROM_ADDRESS_STATE ?? 'IL',
  zip: process.env.STORE_FROM_ADDRESS_ZIP ?? '60601',
  country: 'US',
}

export async function POST(req: NextRequest) {
  const { toAddress, parcel } = await req.json()
  const rates = await getRates({
    fromAddress: FROM_ADDRESS,
    toAddress,
    parcel: parcel ?? { length: 10, width: 8, height: 4, weight: 16 },
  })
  return NextResponse.json(rates)
}
