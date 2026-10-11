import { commerce } from '../data/commerce'
export type PriceLine = { unitPrice: number; quantity: number }
export const toCents = (amount: number) => Math.round(amount * 100)
export function calculateAmounts(items: PriceLine[], couponId: string | null, pointsDiscountCents = 0) {
  const goodsCents = items.reduce((sum, item) => sum + toCents(item.unitPrice) * item.quantity, 0)
  const coupon = commerce.coupons.find(c => c.id === couponId && goodsCents >= c.threshold)
  const couponCents = coupon ? Math.min(coupon.discount, goodsCents) : 0
  // Direct cash deduction remains disabled; member points redeem wallet coupons instead.
  const pointsCents = commerce.points.enabled ? Math.max(0, Math.min(Math.round(pointsDiscountCents), goodsCents - couponCents)) : 0
  const shippingCents = goodsCents === 0 || goodsCents >= commerce.shipping.freeThreshold ? 0 : commerce.shipping.fee
  return {
    quantity: items.reduce((sum, item) => sum + item.quantity, 0),
    goodsAmount: goodsCents / 100, discountAmount: (couponCents + pointsCents) / 100,
    shippingFee: shippingCents / 100, finalAmount: (goodsCents - couponCents - pointsCents + shippingCents) / 100,
    couponId: coupon?.id || null,
  }
}
export function bestCoupon(items: PriceLine[]) {
  const goods = items.reduce((sum, item) => sum + toCents(item.unitPrice) * item.quantity, 0)
  return [...commerce.coupons].reverse().find(c => goods >= c.threshold)?.id || null
}
