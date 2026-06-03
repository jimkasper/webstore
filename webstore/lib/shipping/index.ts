export interface ShipmentInput { fromAddress: Address; toAddress: Address; parcel: Parcel }
export interface Address { name: string; street1: string; city: string; state: string; zip: string; country: string }
export interface Parcel { length: number; width: number; height: number; weight: number }
export interface Rate { id: string; provider: string; service: string; rate: number; currency: string; deliveryDays?: number }
export interface Label { trackingNumber: string; labelUrl: string; carrier: string }

export async function getRates(shipment: ShipmentInput): Promise<Rate[]> {
  const provider = process.env.SHIPPING_PROVIDER ?? 'easypost'
  switch (provider) {
    case 'shippo': return (await import('./shippo')).getRatesShippo(shipment)
    case 'shipstation': return (await import('./shipstation')).getRatesShipStation(shipment)
    default: return (await import('./easypost')).getRatesEasyPost(shipment)
  }
}

export async function createLabel(rateId: string, provider?: string): Promise<Label> {
  const p = provider ?? process.env.SHIPPING_PROVIDER ?? 'easypost'
  switch (p) {
    case 'shippo': return (await import('./shippo')).createLabelShippo(rateId)
    case 'shipstation': return (await import('./shipstation')).createLabelShipStation(rateId)
    default: return (await import('./easypost')).createLabelEasyPost(rateId)
  }
}
