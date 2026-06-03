import { sendResend } from './resend'
import { sendSendGrid } from './sendgrid'
import { sendSmtp } from './smtp'

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER ?? 'smtp'
  switch (provider) {
    case 'resend': return sendResend(to, subject, html)
    case 'sendgrid': return sendSendGrid(to, subject, html)
    default: return sendSmtp(to, subject, html)
  }
}

export function orderConfirmationHtml(orderNumber: string, items: { name: string; quantity: number; price: number }[], total: number): string {
  return `<h1>Order Confirmed</h1><p>Order #${orderNumber}</p><ul>${items.map(i => `<li>${i.name} x${i.quantity} — $${i.price.toFixed(2)}</li>`).join('')}</ul><p><strong>Total: $${total.toFixed(2)}</strong></p><p>Thank you for your purchase!</p>`
}

export function abandonedCartHtml(cartUrl: string): string {
  return `<h1>You left something behind</h1><p>You have items waiting in your cart.</p><a href="${cartUrl}">Return to your cart</a>`
}

export function downloadLinkHtml(productName: string, downloadUrl: string): string {
  return `<h1>Your download is ready</h1><p>${productName}</p><a href="${downloadUrl}">Download now</a><p>This link expires in 48 hours.</p>`
}

export function licenseKeyHtml(productName: string, licenseKey: string): string {
  return `<h1>Your license key</h1><p>${productName}</p><p><strong>${licenseKey}</strong></p>`
}

export function inventoryAlertHtml(productName: string, stock: number): string {
  return `<h1>Low inventory alert</h1><p>${productName} has only ${stock} units remaining.</p>`
}
