import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom'
import { LockKeyhole, Check, ArrowLeft } from 'lucide-react'
import { checkoutLines, useOrders } from '../context/OrderContext'
import { useMember } from '../context/MemberContext'
import { useShop } from '../context/ShopContext'
import { commerce } from '../data/commerce'
import { calculateAmounts } from '../utils/pricing'
import { money } from '../utils/storage'
import { validateReceiver } from '../utils/orders'
import { EmptyState, Header } from '../components/ShopUI'
import { DemoNotice } from '../components/CommerceUI'
export default function Payment(){
  const {checkoutId}=useParams(), {draft,orders,updateDraft,pay}=useOrders(), {notify}=useShop(), navigate=useNavigate()
  const {availableCoupons}=useMember()
  const lock=useRef(false), [busy,setBusy]=useState(false), [error,setError]=useState('')
  const existing=orders.find(order=>order.checkoutId===checkoutId)
  if(existing)return <Navigate to={`/payment-success/${existing.orderId}`} replace/>
  if(!draft||draft.checkoutId!==checkoutId)return <><Header title="模拟支付" back/><EmptyState title="还没有准备好这份甜" text="请先确认商品与收货信息。" action="返回购物车" to="/cart"/></>
  const current=draft
  if(Object.keys(validateReceiver(current.receiverInfo)).length)return <Navigate to={`/checkout/${current.checkoutId}`} replace/>
  const coupon=availableCoupons().find(c=>current.couponInstanceId?c.id===current.couponInstanceId:c.kindId===current.couponId)
  if(current.couponId&&!coupon)return <Navigate to={`/checkout/${current.checkoutId}`} replace/>
  const amounts=calculateAmounts(checkoutLines(current.items),coupon?.kindId||null)
  function confirm(){
    if(lock.current)return
    lock.current=true;setBusy(true);setError('')
    try{const order=pay(current.checkoutId);navigate(`/payment-success/${order.orderId}`,{replace:true})}
    catch(e){const message=(e as Error).message;setError(message);notify(message);lock.current=false;setBusy(false)}
  }
  return <><Header title="模拟支付确认" back/><main className="payment-page commerce-page"><div className="payment-head"><span className="eyebrow">A SWEET LITTLE CHECKOUT</span><div className="payment-lock"><LockKeyhole size={29}/></div><h1>确认这一份甜</h1><p>应付金额</p><strong>¥{money(amounts.finalAmount)}</strong><span>{amounts.quantity} 件商品 · 全部为比赛演示</span></div><DemoNotice payment/>
    <section className="commerce-panel payment-methods"><h2>选择模拟支付方式</h2><p className="subtle-note">仅用于视觉展示，不调用支付 SDK。</p>{commerce.paymentMethods.map(method=><label key={method.id} className={current.paymentMethod===method.id?'active':''}><input type="radio" name="payment-method" aria-label={method.label} checked={current.paymentMethod===method.id} onChange={()=>{try{updateDraft({paymentMethod:method.id})}catch(e){setError((e as Error).message)}}}/><span className={`payment-logo ${method.className}`}>{method.short}</span><span>{method.label}</span><span className="payment-check">{current.paymentMethod===method.id&&<Check size={14}/>}</span></label>)}</section>
    <div className="payment-reminder"><p>点击下方按钮仅生成本地演示订单。</p><p>无需输入支付密码，不会扣款，也不会发货。</p></div>{error&&<p className="payment-error" role="alert">{error}</p>}<button className="primary-button confirm-payment" disabled={busy} onClick={confirm}>{busy?'正在保存演示订单…':'确认模拟支付'}</button><Link to={`/checkout/${current.checkoutId}`} className="payment-back"><ArrowLeft size={14}/>返回修改订单</Link>
  </main></>
}
