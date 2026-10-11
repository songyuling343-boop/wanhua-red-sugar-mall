import { Link } from 'react-router-dom'
import { Minus, Plus, ShieldCheck } from 'lucide-react'
import { commerce } from '../data/commerce'
import type { OrderItem } from '../context/OrderContext'
import { money } from '../utils/storage'
export function DemoNotice({ payment = false }: { payment?: boolean }) {
  return <div className="commerce-demo"><ShieldCheck size={15}/><span>{payment ? commerce.paymentNotice : `${commerce.demoLabel} · 不会发生真实支付与配送`}</span></div>
}
export function QuantityControl({ quantity, onChange }: { quantity: number; onChange: (quantity: number) => void }) {
  return <div className="quantity-control"><button aria-label="减少数量" disabled={quantity<=1} onClick={()=>onChange(quantity-1)}><Minus size={14}/></button><output aria-label="商品数量" aria-live="polite">{quantity}</output><button aria-label="增加数量" disabled={quantity>=99} onClick={()=>onChange(quantity+1)}><Plus size={14}/></button></div>
}
export function OrderItems({ items }: { items: OrderItem[] }) {
  return <div className="order-items">{items.map(item=><article className="order-item" key={`${item.productId}:${item.flavor}`}><Link to={`/product/${item.productId}`}><img src={item.image} alt={item.name}/></Link><div><span className="order-brand">{item.brand}</span><h3>{item.name}</h3><p>{item.spec}</p><p>{item.flavor} · 数量 {item.quantity}</p><div className="order-item-prices"><span>¥{money(item.unitPrice)} / 件</span><strong>¥{money(item.unitPrice*item.quantity)}</strong></div></div></article>)}</div>
}
export function AmountBreakdown({ goodsAmount, discountAmount, shippingFee, finalAmount, quantity, estimated = false }: { goodsAmount:number; discountAmount:number; shippingFee:number; finalAmount:number; quantity?:number; estimated?:boolean }) {
  return <dl className="amount-breakdown">{quantity!==undefined&&<div><dt>商品数量</dt><dd>{quantity} 件</dd></div>}<div><dt>商品总金额</dt><dd>¥{money(goodsAmount)}</dd></div><div><dt>{estimated?'预估优惠（最佳演示券）':'优惠金额'}</dt><dd className="discount-value">-¥{money(discountAmount)}</dd></div><div><dt>{estimated?'预估运费':'运费'}</dt><dd>{shippingFee===0?'¥0.00（包邮）':`¥${money(shippingFee)}`}</dd></div><div className="amount-final"><dt>{estimated?'预计应付':'实付金额'}</dt><dd>¥{money(finalAmount)}</dd></div></dl>
}
