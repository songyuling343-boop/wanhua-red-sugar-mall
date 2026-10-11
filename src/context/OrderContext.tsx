import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { products } from '../data/products'
import { brandById } from '../data/site'
import { commerce } from '../data/commerce'
import { readStorage, writeStorage } from '../utils/storage'
import { calculateAmounts, toCents } from '../utils/pricing'
import { generateOrderId, isReceiver, receiverAddress, uniqueId, validateReceiver } from '../utils/orders'
import type { Receiver } from '../utils/orders'
import { isCartItem, useCart } from './CartContext'
import type { CartItem } from './CartContext'
import { useMember } from './MemberContext'
export type OrderItem = CartItem & { name: string; brand: string; spec: string; image: string; unitPrice: number }
export type CheckoutDraft = {
  checkoutId: string; source: 'cart' | 'buyNow'; items: CartItem[]; receiverInfo: Receiver;
  couponId: string | null; couponInstanceId?: string | null; remark: string; paymentMethod: string;
}
export type Order = {
  orderId: string; checkoutId: string; createdAt: string; status: string; items: OrderItem[];
  goodsAmount: number; discountAmount: number; shippingFee: number; finalAmount: number;
  receiver: string; phone: string; address: string; remark: string; paymentMethod: string; couponId: string | null; couponInstanceId?: string | null;
}
export function checkoutLines(items: CartItem[]): OrderItem[] {
  return items.map(item => {
    const p = products.find(p => p.id === item.productId)!
    return { productId: p.id, flavor: item.flavor, quantity: item.quantity, name: p.name, brand: brandById(p.brand).name, spec: p.spec, image: p.image, unitPrice: p.price }
  })
}
function restoreDraft(raw: unknown): CheckoutDraft | null {
  if (!raw || typeof raw !== 'object') return null
  const d = raw as CheckoutDraft
  if (typeof d.checkoutId !== 'string' || !['cart','buyNow'].includes(d.source) || !Array.isArray(d.items) || !d.items.length || !d.items.every(isCartItem) || !isReceiver(d.receiverInfo) || typeof d.remark !== 'string' || typeof d.paymentMethod !== 'string' || (d.couponId !== null && !commerce.coupons.some(c => c.id === d.couponId))) return null
  return d
}
function restoreOrders(raw: unknown): Order[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((o): o is Order => {
    if (!o || typeof o !== 'object') return false
    const order = o as Order
    return ['orderId','checkoutId','createdAt','status','receiver','phone','address','remark','paymentMethod'].every(key=>typeof (o as Record<string,unknown>)[key] === 'string') && !Number.isNaN(Date.parse(order.createdAt)) && ['goodsAmount','discountAmount','shippingFee','finalAmount'].every(key=> typeof (o as Record<string,unknown>)[key] === 'number' && Number.isFinite((o as Record<string,number>)[key]) && (o as Record<string,number>)[key] >= 0) && Array.isArray(order.items) && order.items.length > 0 && order.items.every(item => item && ['productId','flavor','name','brand','spec','image'].every(key=>typeof (item as Record<string,unknown>)[key] === 'string') && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99 && Number.isFinite(item.unitPrice) && item.unitPrice >= 0)
  })
}
type OrderState = {
  orders: Order[]; draft: CheckoutDraft | null;
  startCheckout: (source: CheckoutDraft['source'], items: CartItem[]) => string;
  updateDraft: (changes: Partial<Pick<CheckoutDraft,'receiverInfo' | 'couponId' | 'couponInstanceId' | 'remark' | 'paymentMethod'>>) => void;
  pay: (checkoutId: string) => Order;
}
const Context = createContext<OrderState | null>(null)
export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders,setOrders] = useState(() => restoreOrders(readStorage<unknown>(commerce.storage.orders, [])))
  const [draft,setDraft] = useState(() => restoreDraft(readStorage<unknown>(commerce.storage.draft,null)))
  const draftRef = useRef(draft)
  const { clearPurchased } = useCart()
  const { availableCoupons,settleOrders } = useMember()
  useEffect(() => {
    // Recover an interrupted cart cleanup after an order was durably saved.
    if (draft?.source === 'cart' && orders.some(o=>o.checkoutId === draft.checkoutId)) clearPurchased(draft.items,draft.checkoutId)
  }, [draft,orders,clearPurchased])
  useEffect(()=>{try{settleOrders(orders)}catch{/* MemberContext exposes retryable storage errors. */}},[orders,settleOrders])
  function startCheckout(source: CheckoutDraft['source'], items: CartItem[]) {
    if (!items.length || !items.every(isCartItem)) throw new Error('请先选择需要结算的商品')
    const goods=checkoutLines(items).reduce((sum,item)=>sum+toCents(item.unitPrice)*item.quantity,0)
    const best=availableCoupons().filter(c=>commerce.coupons.some(rule=>rule.id===c.kindId&&goods>=rule.threshold)).sort((a,b)=>commerce.coupons.find(r=>r.id===b.kindId)!.discount-commerce.coupons.find(r=>r.id===a.kindId)!.discount)[0]
    const next: CheckoutDraft = { checkoutId: uniqueId(), source, items: items.map(({ productId,flavor,quantity })=>({productId,flavor,quantity})), receiverInfo: draftRef.current?.receiverInfo || { ...commerce.defaultReceiver }, couponId: best?.kindId||null, couponInstanceId: best?.id||null, remark: '', paymentMethod: commerce.paymentMethods[0].id }
    if (!writeStorage(commerce.storage.draft,next)) throw new Error('浏览器无法保存结算信息，请允许本地存储后重试')
    draftRef.current = next; setDraft(next); return next.checkoutId
  }
  function updateDraft(changes: Partial<Pick<CheckoutDraft,'receiverInfo' | 'couponId' | 'couponInstanceId' | 'remark' | 'paymentMethod'>>) {
    if (!draftRef.current) return
    const next = { ...draftRef.current, ...changes }
    if (!writeStorage(commerce.storage.draft,next)) throw new Error('未能保存修改，请检查浏览器本地存储')
    draftRef.current = next; setDraft(next)
  }
  function pay(checkoutId: string) {
    // Read persisted history as the source of truth. The checkout token makes double-click,
    // reload and revisiting a paid confirmation idempotent in this local demo.
    const latest = restoreOrders(readStorage<unknown>(commerce.storage.orders, orders))
    const current = draftRef.current
    const existing = latest.find(o=>o.checkoutId===checkoutId)
    if (existing) {
      if (current?.checkoutId === checkoutId && current.source === 'cart' && !clearPurchased(current.items,checkoutId)) throw new Error('订单已保存，但购物车清理未完成，请重试')
      settleOrders([existing]);setOrders(latest); return existing
    }
    if (!current || current.checkoutId !== checkoutId) throw new Error('结算信息已变更，请返回购物车重新选择')
    if (Object.keys(validateReceiver(current.receiverInfo)).length) throw new Error('请先填写完整、正确的收货信息')
    if (!commerce.paymentMethods.some(method=>method.id===current.paymentMethod)) throw new Error('请选择模拟支付方式')
    const items = checkoutLines(current.items)
    const coupon=current.couponId?availableCoupons().find(c=>current.couponInstanceId?c.id===current.couponInstanceId:c.kindId===current.couponId):null
    if(current.couponId&&!coupon)throw new Error('所选优惠券已使用或过期，请返回订单确认页重新选择')
    const amounts = calculateAmounts(items,coupon?.kindId||null)
    const order: Order = {
      orderId: generateOrderId(latest.map(o=>o.orderId)), checkoutId, createdAt: new Date().toISOString(), status: commerce.status,
      items, goodsAmount: amounts.goodsAmount, discountAmount: amounts.discountAmount, shippingFee: amounts.shippingFee, finalAmount: amounts.finalAmount,
      receiver: current.receiverInfo.receiver.trim(), phone: current.receiverInfo.phone.trim(), address: receiverAddress(current.receiverInfo), remark: current.remark.trim(), paymentMethod: current.paymentMethod, couponId: amounts.couponId, couponInstanceId: amounts.couponId?coupon?.id||null:null,
    }
    const next = [order,...latest]
    if (!writeStorage(commerce.storage.orders,next)) throw new Error('订单未能保存，未完成模拟支付。请检查本地存储后重试')
    // Save the order first; never discard cart contents when saving the order fails.
    if (current.source === 'cart' && !clearPurchased(current.items,checkoutId)) throw new Error('订单已保存，但购物车清理未完成，请重试')
    settleOrders([order]);setOrders(next)
    return order
  }
  return <Context.Provider value={{ orders,draft,startCheckout,updateDraft,pay }}>{children}</Context.Provider>
}
export function useOrders() { const value=useContext(Context);if(!value)throw new Error('OrderProvider missing');return value }
