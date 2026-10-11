import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { MapPin, Ticket, MessageSquare, Coins, ChevronRight } from 'lucide-react'
import { checkoutLines, useOrders } from '../context/OrderContext'
import { Link } from 'react-router-dom'
import { useMember } from '../context/MemberContext'
import { useShop } from '../context/ShopContext'
import { commerce } from '../data/commerce'
import { calculateAmounts, toCents } from '../utils/pricing'
import { money } from '../utils/storage'
import { validateReceiver } from '../utils/orders'
import type { Receiver } from '../utils/orders'
import { EmptyState, Header, PriceNotice } from '../components/ShopUI'
import { AmountBreakdown, DemoNotice, OrderItems } from '../components/CommerceUI'
export default function Checkout(){
  const {checkoutId}=useParams(), {draft,orders,updateDraft}=useOrders(), {notify}=useShop(), navigate=useNavigate()
  const {availableCoupons,state:member}=useMember()
  const [errors,setErrors]=useState<Partial<Record<keyof Receiver,string>>>({})
  const existing=orders.find(o=>o.checkoutId===checkoutId)
  if(existing)return <Navigate to={`/payment-success/${existing.orderId}`} replace/>
  if(!draft||draft.checkoutId!==checkoutId)return <><Header title="确认订单" back/><EmptyState title="这份心意需要重新挑选" text="结算草稿不存在或已变更，请回到购物袋选择商品。" action="返回购物车" to="/cart"/></>
  const current=draft, lines=checkoutLines(current.items), coupons=availableCoupons(), activeCoupon=coupons.find(c=>current.couponInstanceId?c.id===current.couponInstanceId:c.kindId===current.couponId), amounts=calculateAmounts(lines,activeCoupon?.kindId||null)
  function update(changes: Parameters<typeof updateDraft>[0]){try{updateDraft(changes)}catch(error){notify((error as Error).message)}}
  function changeReceiver(key: keyof Receiver,value:string){update({receiverInfo:{...current.receiverInfo,[key]:value}});setErrors(old=>({...old,[key]:undefined}))}
  function submit(){
    const invalid=validateReceiver(current.receiverInfo);setErrors(invalid)
    if(Object.keys(invalid).length){notify('请完善收货信息');requestAnimationFrame(()=>document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());return}
    if(current.couponId&&!activeCoupon){notify('所选优惠券已失效，请重新选择或不使用优惠券');return}
    navigate(`/payment/${current.checkoutId}`)
  }
  const field=(key:keyof Receiver,label:string,placeholder:string,maxLength:number,inputMode?:'tel')=><label className="receiver-field"><span>{label}</span><input value={current.receiverInfo[key]} aria-label={label} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`error-${key}`:undefined} onChange={e=>changeReceiver(key,e.target.value)} placeholder={placeholder} maxLength={maxLength} inputMode={inputMode} autoComplete="off"/>{errors[key]&&<small id={`error-${key}`} className="field-error">{errors[key]}</small>}</label>
  return <><Header title="确认这份甜蜜" back/><main className="checkout-page commerce-page"><div className="checkout-heading"><span className="eyebrow">ONE STEP CLOSER TO SWEETNESS</span><h1>一份甜，即将出发。</h1><p>{current.source==='buyNow'?'立即购买 · 独立结算，不影响购物袋':'购物袋结算 · 仅包含本次勾选商品'}</p></div><DemoNotice/>
    <section className="commerce-panel receiver-panel"><h2><MapPin size={18}/>收货信息<span className="demo-chip">可编辑</span></h2><div className="address-demo-note">已预置演示信息，仅用于比赛展示，请勿填写真实隐私信息。</div><div className="receiver-fields">{field('receiver','收货人姓名','请输入收货人姓名',30)}{field('phone','手机号码','请输入11位手机号',11,'tel')}<div className="region-fields">{field('province','省','省',20)}{field('city','市','市',20)}{field('district','区 / 县','区 / 县',20)}</div>{field('detail','详细地址','街道、门牌等详细地址',150)}</div><div className="address-border"/></section>
    <section className="commerce-panel"><h2>商品信息<span className="panel-caption">共 {amounts.quantity} 件</span></h2><OrderItems items={lines}/></section>
    <section className="commerce-panel coupons-panel"><h2><Ticket size={18}/>甜蜜优惠<span className="demo-chip">会员演示券包</span></h2><div className="coupon-options"><label className={!activeCoupon?'active':''}><input type="radio" name="coupon" checked={!activeCoupon} onChange={()=>update({couponId:null,couponInstanceId:null})}/><span>不使用优惠券</span></label>{coupons.map(coupon=>{const c=commerce.coupons.find(rule=>rule.id===coupon.kindId)!, eligible=toCents(amounts.goodsAmount)>=c.threshold;return <label data-coupon-id={coupon.id} className={`${eligible?'':'unavailable'} ${activeCoupon?.id===coupon.id?'active':''}`} key={coupon.id}><input type="radio" name="coupon" aria-label={coupon.source==='积分兑换'?`${c.title} · 积分兑换`:c.title} disabled={!eligible} checked={activeCoupon?.id===coupon.id} onChange={()=>update({couponId:c.id,couponInstanceId:coupon.id})}/><span><b>{c.title}</b><small>{eligible?`可用 · ${coupon.source}`:`还差 ¥${money((c.threshold-toCents(amounts.goodsAmount))/100)} 可用`}</small></span><strong>¥{money(c.discount/100)}</strong></label>})}</div>{current.couponId&&!activeCoupon&&<p className="field-error">所选券已失效，请重新选择。</p>}<div className="points-reserve"><Coins size={17}/><div><strong>可用积分 {member.points}</strong><p>可兑换优惠券，不直接抵扣现金</p></div><Link to="/member/coupons">去兑换</Link></div></section>
    <section className="commerce-panel"><h2><MessageSquare size={18}/>订单备注<span className="panel-caption">选填</span></h2><textarea aria-label="订单备注" value={current.remark} onChange={e=>update({remark:e.target.value})} placeholder="请输入口味偏好、礼盒需求等备注" maxLength={200}/><div className="remark-count">{current.remark.length}/200</div></section>
    <section className="commerce-panel"><h2>金额明细</h2><AmountBreakdown {...amounts}/><p className="subtle-note">演示运费：商品原总额满 ¥{money(commerce.shipping.freeThreshold/100)} 包邮，未满收取 ¥{money(commerce.shipping.fee/100)}。优惠券不叠加。</p><PriceNotice/></section>
    <div className="commerce-fixed-bar"><div className="bar-amount"><span>应付金额 · 演示</span><strong>¥{money(amounts.finalAmount)}</strong></div><button className="buy-button" onClick={submit}>提交订单<ChevronRight size={16}/></button></div>
  </main></>
}
// Draft is kept in OrderContext/localStorage, not transient navigation state.
