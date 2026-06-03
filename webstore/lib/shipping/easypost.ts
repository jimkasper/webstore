import type { ShipmentInput, Rate, Label } from './index'

const BASE = 'https://api.easypost.com/v2'
const auth = () => Buffer.from(`${process.env.EASYPOST_API_KEY}:`).toString('base64')

export async function getRatesEasyPost(input: ShipmentInput): Promise<Rate[]> {
  const res = await fetch(`${BASE}/shipments`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipment: { from_address: input.fromAddress, to_address: input.toAddress, parcel: input.parcel } }),
  })
  if (!res.ok) throw new Error(`EasyPost error: ${res.status}`)
  const data = await res.json()
  return (data.rates ?? []).map((r: any) => ({ id: r.id, provider: 'easypost', service: `${r.carrier} ${r.service}`, rate: parseFloat(r.rate), currency: r.currency, deliveryDays: r.delivery_days }))
}

export async function createLabelEasyPost(rateId: string): Promise<Label> {
  const res = await fetch(`${BASE}/shipments/${rateId}/buy`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ rate: { id: rateId } }),
  })
  if (!res.ok) throw new Error(`EasyPost label error: ${res.status}`)
  const data = await res.json()
  return { trackingNumber: data.tracking_code, labelUrl: data.postage_label?.label_url, carrier: data.selected_rate?.carrier }
}
