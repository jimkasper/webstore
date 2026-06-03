import type { ShipmentInput, Rate, Label } from './index'

const BASE = 'https://api.goshippo.com'
const hdr = () => ({ Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`, 'Content-Type': 'application/json' })

export async function getRatesShippo(input: ShipmentInput): Promise<Rate[]> {
  const res = await fetch(`${BASE}/shipments/`, {
    method: 'POST', headers: hdr(),
    body: JSON.stringify({ address_from: input.fromAddress, address_to: input.toAddress, parcels: [input.parcel], async: false }),
  })
  if (!res.ok) throw new Error(`Shippo error: ${res.status}`)
  const data = await res.json()
  return (data.rates ?? []).map((r: any) => ({ id: r.object_id, provider: 'shippo', service: `${r.provider} ${r.servicelevel?.name}`, rate: parseFloat(r.amount), currency: r.currency, deliveryDays: r.estimated_days }))
}

export async function createLabelShippo(rateId: string): Promise<Label> {
  const res = await fetch(`${BASE}/transactions/`, {
    method: 'POST', headers: hdr(),
    body: JSON.stringify({ rate: rateId, label_file_type: 'PDF', async: false }),
  })
  if (!res.ok) throw new Error(`Shippo label error: ${res.status}`)
  const data = await res.json()
  return { trackingNumber: data.tracking_number, labelUrl: data.label_url, carrier: data.provider }
}
