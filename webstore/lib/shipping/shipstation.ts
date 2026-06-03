import type { ShipmentInput, Rate, Label } from './index'

const BASE = 'https://ssapi.shipstation.com'
const auth = () => Buffer.from(`${process.env.SHIPSTATION_API_KEY}:${process.env.SHIPSTATION_API_SECRET}`).toString('base64')

export async function getRatesShipStation(input: ShipmentInput): Promise<Rate[]> {
  const res = await fetch(`${BASE}/shipments/getrates`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromPostalCode: input.fromAddress.zip, toState: input.toAddress.state, toCountry: input.toAddress.country, toPostalCode: input.toAddress.zip, weight: { value: input.parcel.weight, units: 'ounces' }, dimensions: { units: 'inches', length: input.parcel.length, width: input.parcel.width, height: input.parcel.height } }),
  })
  if (!res.ok) throw new Error(`ShipStation error: ${res.status}`)
  const data = await res.json()
  return (data ?? []).map((r: any) => ({ id: `${r.carrierCode}:${r.serviceCode}`, provider: 'shipstation', service: `${r.carrierCode} ${r.serviceName}`, rate: r.shipmentCost + r.otherCost, currency: 'USD' }))
}

export async function createLabelShipStation(_rateId: string): Promise<Label> {
  throw new Error('ShipStation label creation requires an active order. Create the order in ShipStation first.')
}
