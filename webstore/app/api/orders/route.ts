import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, orderConfirmationHtml, downloadLinkHtml, licenseKeyHtml, inventoryAlertHtml } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { items, customerEmail, customerName, shippingAddress, paymentMethod, paymentRef, subtotal, tax, shipping, total, discountCode, affiliateCode } = body

  let discountCodeRecord = null
  if (discountCode) {
    discountCodeRecord = await prisma.discountCode.findUnique({ where: { code: discountCode } })
    if (discountCodeRecord) await prisma.discountCode.update({ where: { id: discountCodeRecord.id }, data: { usageCount: { increment: 1 } } })
  }

  let affiliateRecord = null
  if (affiliateCode) affiliateRecord = await prisma.affiliate.findUnique({ where: { code: affiliateCode } })

  const order = await prisma.order.create({
    data: {
      status: 'PAID', subtotal, tax, shipping, total, paymentMethod, paymentRef,
      customerEmail, customerName, shippingAddress,
      discountCodeId: discountCodeRecord?.id ?? null,
      affiliateId: affiliateRecord?.id ?? null,
      items: { create: items.map((i: any) => ({ productId: i.productId, variantId: i.variantId ?? null, name: i.name, price: i.price, quantity: i.quantity })) },
    },
    include: { items: { include: { product: true } } },
  })

  if (affiliateRecord) {
    await prisma.affiliate.update({ where: { id: affiliateRecord.id }, data: { earnings: { increment: total * affiliateRecord.commissionPct / 100 } } })
    await prisma.affiliateClick.updateMany({ where: { affiliateId: affiliateRecord.id, orderId: null }, data: { orderId: order.id } })
  }

  for (const item of order.items) {
    if (item.product.type === 'DIGITAL') {
      const token = await prisma.downloadToken.create({
        data: { orderItemId: item.id, variantId: item.variantId, expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), usesRemaining: 5 },
      })
      const downloadUrl = `${process.env.STORE_BASE_URL}/download/${token.token}`
      await sendEmail(customerEmail, `Your download: ${item.name}`, downloadLinkHtml(item.name, downloadUrl))
      const licKey = await prisma.licenseKey.create({ data: { orderItemId: item.id, variantId: item.variantId, key: uuidv4().toUpperCase() } })
      await sendEmail(customerEmail, `License key: ${item.name}`, licenseKeyHtml(item.name, licKey.key))
    }
    if (item.variantId) {
      const variant = await prisma.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } }, select: { stock: true, name: true, product: { select: { name: true } } } })
      const threshold = Number(process.env.INVENTORY_ALERT_THRESHOLD ?? 5)
      if (variant.stock <= threshold && process.env.ADMIN_EMAIL) {
        await sendEmail(process.env.ADMIN_EMAIL, `Low inventory: ${variant.product.name}`, inventoryAlertHtml(`${variant.product.name} — ${variant.name}`, variant.stock))
      }
    }
  }

  await sendEmail(customerEmail, `Order confirmed #${order.id.slice(-8).toUpperCase()}`, orderConfirmationHtml(order.id.slice(-8).toUpperCase(), order.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })), total))
  if (process.env.ADMIN_EMAIL) {
    await sendEmail(process.env.ADMIN_EMAIL, `New order #${order.id.slice(-8).toUpperCase()} — $${total.toFixed(2)}`, `<p>New order from ${customerEmail} for $${total.toFixed(2)}</p>`)
  }

  return NextResponse.json({ orderId: order.id })
}

export async function GET() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true }, take: 100 })
  return NextResponse.json(orders)
}
