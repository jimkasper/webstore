interface BTCPayInvoice {
  id: string
  checkoutLink: string
}

interface BTCPayInvoiceStatus {
  status: string
}

export async function createInvoice(
  amount: number,
  currency: string,
  orderId: string
): Promise<BTCPayInvoice> {
  const res = await fetch(
    `${process.env.BTCPAY_URL}/api/v1/stores/${process.env.BTCPAY_STORE_ID}/invoices`,
    {
      method: 'POST',
      headers: {
        Authorization: `token ${process.env.BTCPAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        orderId,
        checkout: {
          redirectURL: `${process.env.STORE_BASE_URL}/checkout/complete?order=${orderId}`,
          redirectAutomatically: true,
        },
      }),
    }
  )
  if (!res.ok) throw new Error(`BTCPay error: ${res.status}`)
  const data = await res.json()
  return { id: data.id, checkoutLink: data.checkoutLink }
}

export async function getInvoice(invoiceId: string): Promise<BTCPayInvoiceStatus> {
  const res = await fetch(
    `${process.env.BTCPAY_URL}/api/v1/stores/${process.env.BTCPAY_STORE_ID}/invoices/${invoiceId}`,
    { headers: { Authorization: `token ${process.env.BTCPAY_API_KEY}` } }
  )
  if (!res.ok) throw new Error(`BTCPay error: ${res.status}`)
  const data = await res.json()
  return { status: data.status }
}
